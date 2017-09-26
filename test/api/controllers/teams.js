const should = require('should')
const request = require('supertest')
const server = require('../helpers/appMock')
const sinon = require('sinon')
const enroll = require('../../../api/controllers/enroll')

describe('controllers', function() {

  describe('teams', function() {

    describe('GET /teams', function() {

      it('should return teams', function(done) {

        process.env.ADMIN_APIKEY = 'ThisIsAdmin!'

        const tryGetTeamsStub = sinon.stub(enroll.mongodb, 'tryGetTeams').callsFake(() => {
          return {
            then (cb) {
              cb([
                {
                  id: 'blabla2',
                  teamName: 'TeamB',
                  teamMembers: ['Zino', 'Xino'],
                  teamEmailAddress: 'dino@gino.com'
                },
                {
                  id: 'blabla',
                  teamName: 'TeamA',
                  teamMembers: ['Gino', 'Pino'],
                  teamEmailAddress: 'tino@gino.com'
                }
              ])
              return {
                catch () {}
              }
            },
          }
        })

        request(server)
          .get('/teams')
          .set('Accept', 'application/json')
          .set('Authorization', 'ThisIsAdmin!')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            should.exist(res.body.teams)
            res.body.teams.length.should.eql(2)
            res.body.teams[0].id.should.eql('blabla2')
            res.body.teams[0].teamName.should.eql('TeamB')
            res.body.teams[0].teamMembers.should.eql(['Zino', 'Xino'])
            res.body.teams[0].teamEmailAddress.should.eql('dino@gino.com')
            res.body.teams[1].id.should.eql('blabla')
            res.body.teams[1].teamName.should.eql('TeamA')
            res.body.teams[1].teamMembers.should.eql(['Gino', 'Pino'])
            res.body.teams[1].teamEmailAddress.should.eql('tino@gino.com')
            tryGetTeamsStub.restore()
            done()
          })
      })
    })

  })

})
