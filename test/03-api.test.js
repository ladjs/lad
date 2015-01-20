
// # tests - api

var util = require('util');
var request = require('supertest');
var app = require('../app');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var utils = require('./utils');
var async = require('async');
var IoC = require('electrolyte');
var cheerio = require('cheerio');

chai.should();
chai.use(sinonChai);

request = request(app);

// storage for context-specific variables throughout the tests
var context = {};

describe('/api', function() {

  var User = IoC.create('models/user');

  // Clean DB and add 3 sample users before tests start
  before(function(done) {
    // We need this timeout increased because "registering" a user instead of just saving takes longer
    this.timeout(5000);

    async.waterfall([
      utils.cleanDatabase,
      function createTestUsers(callback) {
        // Create 3 test users
        async.timesSeries(3, function(i, _callback) {
          var user = {
            email: 'email+' + i + '@example.com',
            name: 'User #' + i,
            surname: 'Last Name #' + i,
            password: '123456a' + i
          };

          // Save the details for the second user
          if ( i === 1 ) {
            context.testUser = user;
          }

          // Registering instead of saving so we can login with the user
          User.register({
            email: user.email,
            name: user.name,
            surname: user.surname
          }, user.password, _callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /api/auth/email - should return 200 with user object', function(done) {
    request
      .post('/api/auth/email')
      .send({
        email: context.testUser.email,
        password: context.testUser.password
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var result = res.body;

        // Test the attributes exist
        expect(result).to.exist;
        result.should.have.property('id');
        result.should.have.property('name');
        result.should.have.property('surname');
        result.should.not.have.property('password');

        // Test the values make sense
        result.name.should.equal(context.testUser.name);
        result.surname.should.equal(context.testUser.surname);

        // Store the API token to use it later
        context.testUser.apiToken = result.api_token;

        done();
      });
  });

  it('PUT /api/user - should return 200 with user object', function(done) {
    request
      .put('/api/user')
      .auth(context.testUser.apiToken, 'a')// Apparently supertest or basic-auth need password to not be empty
      .send({
        email: context.testUser.email,
        name: 'Nifty',
        surname: 'Lettuce'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var result = res.body;

        // Test the attributes exist
        expect(result).to.exist;
        result.should.have.property('id');
        result.should.have.property('name');
        result.should.have.property('surname');
        result.should.not.have.property('password');

        // Test the values make sense
        result.name.should.equal('Nifty');
        result.surname.should.equal('Lettuce');

        done();
      });
  });

});
