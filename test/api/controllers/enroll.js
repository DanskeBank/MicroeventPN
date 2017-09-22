const should = require('should');
const request = require('supertest');
const server = require('../helpers/appMock');
const sinon = require('sinon')
const enroll = require('../../../api/controllers/enroll');

describe('controllers', function() {

  describe('enroll', function() {

    describe('POST /enroll', function() {

      it('should return 400 - Bad Request', function(done) {

        request(server)
          .post('/enroll')
          .set('Accept', 'application/json')
          .send({
            teamNamesas: 'TeamA',
            teamMembers: ['Gino', 'Pino'],
            teamEmailAddress: 'tino@gino.com'
          })
          .expect('Content-Type', /application\/json/)
          .expect(400)
          .end(function(err, res) {
            res.body.code.should.eql('SCHEMA_VALIDATION_FAILED');
            done();
          });
      });

      it('should return a default string', function(done) {
        sinon.stub(enroll.mongodb, 'storeEnrollment').callsFake((requestId, data) => {
          should.exist(requestId)
          should.exist(data)
          data.teamName.should.eql('TeamA')
          data.teamMembers.should.eql(['Gino', 'Pino'])
          data.teamEmailAddress.should.eql('tino@gino.com')
          return {
            then (cb) {
              cb()
              return {
                catch () {}
              }
            },
          }
        })

        sinon.stub(enroll.emailService, 'setApiKey')
        sinon.stub(enroll.emailService, 'sendVerificationEmail').callsFake((data) => {
          should.exist(data)
          data.to.should.eql('tino@gino.com')
        })

        request(server)
          .post('/enroll')
          .set('Accept', 'application/json')
          .send({
            teamName: 'TeamA',
            teamMembers: ['Gino', 'Pino'],
            teamEmailAddress: 'tino@gino.com'
          })
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql({status: 'OK'});

            done();
          });
      });

    });

  });

});
