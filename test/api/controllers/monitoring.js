const should = require('should')
const request = require('supertest')
const server = require('../helpers/appMock')
const sinon = require('sinon')
const enroll = require('../../../api/controllers/enroll')

describe('controllers', function() {

  describe('monitoring', function() {

    describe('GET /monitoring/teamId21768', function() {

      it('should return status OK', function(done) {

        process.env.ADMIN_APIKEY = 'ThisIsAdmin!'

        const tryGetTeamStub = sinon.stub(enroll.mongodb, 'tryGetTeam').callsFake((apiKey) => {
          apiKey.should.eql('ThisIsAdmin!')
          return {
            then (cb) {
              cb({
                teamId: 'teamId21768',
                teamName: 'TeamA',
                teamMembers: ['Gino', 'Pino'],
                teamEmailAddress: 'tino@gino.com'
              })
              return {
                catch () {}
              }
            },
          }
        })

        const tryGetMonitorStatusStub = sinon.stub(enroll.mongodb, 'tryGetMonitorStatus').callsFake((teamId) => {
          teamId.should.eql('teamId21768')
          return {
            then (cb) {
              cb({
                  microservices: [
                    {
                      name: 'MonitorMS',
                      status: true
                    },
                    {
                      name: 'APIGateway',
                      status: false
                    }
                  ]
                })
              return {
                catch () {}
              }
            },
          }
        })

        request(server)
          .get('/monitoring/teamId21768')
          .set('Accept', 'application/json')
          .set('Authorization', 'ThisIsAdmin!')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            should.exist(res.body.microservices)
            res.body.microservices.length.should.eql(2)
            res.body.microservices[0].name.should.eql('MonitorMS')
            res.body.microservices[0].status.should.eql(true)
            res.body.microservices[1].name.should.eql('APIGateway')
            res.body.microservices[1].status.should.eql(false)
            tryGetMonitorStatusStub.restore()
            tryGetTeamStub.restore()
            done()
          })
      })
    })

    describe('GET /monitoring/teamId21768', function() {

      it('should return status OK for non Admin', function(done) {
        
        const tryGetTeamStub = sinon.stub(enroll.mongodb, 'tryGetTeam').callsFake((apiKey) => {
          apiKey.should.eql('apiKey8937987389!')
          return {
            then (cb) {
              cb({
                teamId: 'teamId21768',
                teamName: 'TeamA',
                teamMembers: ['Gino', 'Pino'],
                teamEmailAddress: 'tino@gino.com'
              })
              return {
                catch () {}
              }
            },
          }
        })

        const tryGetMonitorStatusStub = sinon.stub(enroll.mongodb, 'tryGetMonitorStatus').callsFake((teamId) => {
          teamId.should.eql('teamId21768')
          return {
            then (cb) {
              cb({
                  microservices: [
                    {
                      name: 'MonitorMS',
                      status: true
                    },
                    {
                      name: 'APIGateway',
                      status: false
                    }
                  ]
                })
              return {
                catch () {}
              }
            },
          }
        })

        process.env.ADMIN_APIKEY = 'ThisIsAdmin!'

        request(server)
          .get('/monitoring/teamId21768')
          .set('Accept', 'application/json')
          .set('Authorization', 'apiKey8937987389!')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            should.exist(res.body.microservices)
            res.body.microservices.length.should.eql(2)
            res.body.microservices[0].name.should.eql('MonitorMS')
            res.body.microservices[0].status.should.eql(true)
            res.body.microservices[1].name.should.eql('APIGateway')
            res.body.microservices[1].status.should.eql(false)
            tryGetTeamStub.restore()
            tryGetMonitorStatusStub.restore()
            done()
          })
      })
    })

    describe('GET /monitoring/teamId21768', function() {

      it('should return authorization error', function(done) {

        const tryGetTeamStub = sinon.stub(enroll.mongodb, 'tryGetTeam').callsFake((apiKey) => {
          apiKey.should.eql('ThisIsAdminNotAdmin!')
          return {
            then (cb) {
              cb({
                teamId: 'blabla',
                teamName: 'TeamA',
                teamMembers: ['Gino', 'Pino'],
                teamEmailAddress: 'tino@gino.com'
              })
              return {
                catch () {}
              }
            },
          }
        })

        process.env.ADMIN_APIKEY = 'ThisIsAdmin!'

        request(server)
          .get('/monitoring/teamId21768')
          .set('Accept', 'application/json')
          .set('Authorization', 'ThisIsAdminNotAdmin!')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            res.body.message.should.eql('Internal Server Error')
            tryGetTeamStub.restore()
            done()
          })
      })
    })

    describe('POST /monitoring/teamId21768', function() {

      it('should return status OK', function(done) {

        const tryGetTeamStub = sinon.stub(enroll.mongodb, 'tryGetTeam').callsFake((apiKey) => {
          apiKey.should.eql('apiKey8937987389')
          return {
            then (cb) {
              cb({
                teamId: 'teamId21768',
                teamName: 'TeamA',
                teamMembers: ['Gino', 'Pino'],
                teamEmailAddress: 'tino@gino.com'
              })
              return {
                catch () {}
              }
            },
          }
        })

        const storeMonitorStatusStub = sinon.stub(enroll.mongodb, 'storeMonitorStatus').callsFake((teamId, monitorStatus) => {
          teamId.should.eql('teamId21768')
          should.exist(monitorStatus)
          should.exist(monitorStatus.microservices)
          monitorStatus.microservices.length.should.eql(2)
          monitorStatus.microservices[0].name.should.eql('MonitorMS')
          monitorStatus.microservices[0].status.should.eql(true)
          monitorStatus.microservices[1].name.should.eql('APIGateway')
          monitorStatus.microservices[1].status.should.eql(false)
          return {
            then (cb) {
              cb()
              return {
                catch () {}
              }
            },
          }
        })

        request(server)
          .post('/monitoring/teamId21768')
          .set('Accept', 'application/json')
          .set('Authorization', 'apiKey8937987389')
          .set('Content-Type', 'application/json')
          .send({
            microservices: [
              {
                name: 'MonitorMS',
                status: true
              },
              {
                name: 'APIGateway',
                status: false
              }
            ]
          })
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            res.body.status.should.eql('OK')
            tryGetTeamStub.restore()
            storeMonitorStatusStub.restore()
            done()
          })
      })
    })

    describe('POST /monitoring/teamId21768', function() {

      it('should return internal server error', function(done) {

        const tryGetTeamStub = sinon.stub(enroll.mongodb, 'tryGetTeam').callsFake((apiKey) => {
          apiKey.should.eql('apiKey8937987389')
          return {
            then (cb) {
              cb({
                teamId: 'wrongTeam',
                teamName: 'TeamWrong',
                teamMembers: ['Fino', 'Dino'],
                teamEmailAddress: 'zino@gino.com'
              })
              return {
                catch () {}
              }
            },
          }
        })

        request(server)
          .post('/monitoring/teamId21768')
          .set('Accept', 'application/json')
          .set('Authorization', 'apiKey8937987389')
          .set('Content-Type', 'application/json')
          .send({
            microservices: [
              {
                name: 'MonitorMS',
                status: true
              },
              {
                name: 'APIGateway',
                status: false
              }
            ]
          })
          .expect('Content-Type', /application\/json/)
          .expect(500)
          .end(function(err, res) {
            res.body.message.should.eql('Internal Server Error')
            tryGetTeamStub.restore()
            done()
          })
      })
    })

  })

})
