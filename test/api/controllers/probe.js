var should = require('should');
var request = require('supertest');
var server = require('../helpers/appMock');

describe('controllers', function() {

  describe('probe', function() {

    describe('GET /health', function() {

      it('should return a default string', function(done) {

        request(server)
          .get('/health')
          .set('Accept', 'application/json')
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
