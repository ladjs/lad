
var request = require('supertest')
var app = require('../app')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect

chai.should()
chai.use(sinonChai)

describe('route loading', function() {

  it('should return 200 if home page loads', function(done) {
    request(app)
      .get('/')
      .expect(200, done)
  })

  it('should return 200 if user listing loads', function(done) {
    request(app)
      .get('/users')
      .expect(200, done)
  })

})
