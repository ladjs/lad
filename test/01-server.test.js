
// # tests - server

var util = require('util');
var request = require('supertest');
var app = require('../app');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.should();
chai.use(sinonChai);

request = request(app);

describe('server', function() {

  it('should return 200 if home page loads', function(done) {
    request
      .get('/')
      .accept('application/json')
      .expect(200)
      .end(done);
  });

});
