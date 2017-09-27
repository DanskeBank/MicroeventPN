const should = require('should')
const request = require('supertest')
const server = require('../helpers/appMock')
const sinon = require('sinon')
const enroll = require('../../../api/controllers/enroll')

describe('controllers', function() {

  describe('opschat', function() {

    describe('GET /opschat/2', function() {

      it('should return messages', function(done) {

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

        const tryGetChatMessages = sinon.stub(enroll.mongodb, 'tryGetChatMessages').callsFake((pageId) => {
          pageId.should.eql(2)
          
          return {
            then (cb) {
              cb([{
                from: 'Tino',
                message: 'Ciao!'
              },{
                from: 'Gino',
                message: 'Giao!'
              }])
              return {
                catch () {}
              }
            },
          }
        })
        request(server)
          .get('/opschat/2')
          .set('Accept', 'application/json')
          .set('Authorization', 'apiKey8937987389')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            should.exist(res.body.messages)
            res.body.messages.length.should.eql(2)
            res.body.messages[0].from.should.eql('Tino')
            res.body.messages[0].message.should.eql('Ciao!')
            res.body.messages[1].from.should.eql('Gino')
            res.body.messages[1].message.should.eql('Giao!')
            tryGetTeamStub.restore()
            tryGetChatMessages.restore()
            done()
          })
      })
    })

    describe('POST /opschat', function() {

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

        const storeChatMessageStub = sinon.stub(enroll.mongodb, 'storeChatMessage').callsFake((storeChatMessage) => {
          should.exist(storeChatMessage)
          should.exist(storeChatMessage.team)
          should.exist(storeChatMessage.timestamp)
          storeChatMessage.team.teamId.should.eql('teamId21768')
          storeChatMessage.team.teamName.should.eql('TeamA')
          storeChatMessage.team.teamMembers.should.eql(['Gino', 'Pino'])
          storeChatMessage.team.teamEmailAddress.should.eql('tino@gino.com')
          
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
          .post('/opschat')
          .set('Accept', 'application/json')
          .set('Authorization', 'apiKey8937987389')
          .set('Content-Type', 'application/json')
          .send({
            from: 'Gino Pino',
            message: 'Hello youngsters!'
          })
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            res.body.should.eql({status: 'OK'})
            tryGetTeamStub.restore()
            storeChatMessageStub.restore()
            done()
          })
      })
    })

  })

})
