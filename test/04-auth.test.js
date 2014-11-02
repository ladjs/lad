
// # tests - auth

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

var agent = request.agent(app);
request = request(app);

// storage for context-specific variables throughout the tests
var context = {};

describe('auth', function() {

  var User = IoC.create('models/user');

  // Clean DB and add 3 sample users before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTestUsers(callback) {
        // Create 3 test users
        async.timesSeries(3, function(i, _callback) {
          var user = new User({
            email: 'email+' + i + '@example.com',
            name: 'User #' + i,
            surname: 'Last Name #' + i,
            password: '1234' + i
          });

          user.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('GET /my-account — should redirect me to /login and show error without login', function(done) {
    agent
      .get('/my-account')
      .accept('text/html')
      .expect(302)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.headers.location).to.exist;

        // Test the values make sense
        res.headers.location.should.equal('/login');

        done();
      });
  });

  it('GET /signup — should show me email and password form fields', function(done) {
    agent
      .get('/signup')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text);
        var $container = $('.container form');

        // Test the values make sense
        $container.should.have.length.of(1);
        $container.find('input[name="email"]').should.have.length.of.least(1);
        $container.find('input[name="password"]').should.have.length.of.least(1);
        $container.find('button[type="submit"]').should.have.length.of.least(1);

        // Save for later use
        context.csrf = $container.find('input[name="_csrf"]').val();

        done();
      });
  });

  it('POST /signup — should create an account and redirect me to /my-account', function(done) {

    // This does take a couple of seconds on average
    this.timeout(5000);

    agent
      .post('/signup')
      .send({
        _csrf: context.csrf,
        email: 'test+something@example.com',
        name: 'Test',
        surname: 'Something',
        password: '123a-c456'
      })
      .accept('text/html')
      .expect(302)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.headers.location).to.exist;

        // Test the values make sense
        res.headers.location.should.equal('/my-account');

        // Test we can fetch the user from the DB
        User.findOne({
          email: 'test+something@example.com'
        }, function(err, user) {
          if (err) return done(err);

          expect(user).to.exist;

          user.should.have.property('name');
          user.name.should.equal('Test');

          done();
        });
      });
  });

  it('GET /login — should redirect me to / if logged in', function(done) {
    agent
      .get('/login')
      .accept('text/html')
      .expect(302)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.headers.location).to.exist;

        // Test the values make sense
        res.headers.location.should.equal('/');

        done();
      });
  });

  it('GET /logout — should log me out and redirect me to /', function(done) {
    agent
      .get('/logout')
      .accept('text/html')
      .expect(302)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.headers.location).to.exist;

        // Test the values make sense
        res.headers.location.should.equal('/');

        done();
      });
  });

  it('GET /login — should show me email and password form fields', function(done) {
    agent
      .get('/login')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text);
        var $container = $('.container form');

        // Test the values make sense
        $container.should.have.length.of(1);
        $container.find('input[name="email"]').should.have.length.of.least(1);
        $container.find('input[name="password"]').should.have.length.of.least(1);
        $container.find('button[type="submit"]').should.have.length.of.least(1);

        // Save for later use
        context.csrf = $container.find('input[name="_csrf"]').val();

        done();
      });
  });

  it('POST /login — should log me in and redirect me to /', function(done) {
    agent
      .post('/login')
      .send({
        _csrf: context.csrf,
        email: 'test+something@example.com',
        password: '123a-c456'
      })
      .accept('text/html')
      .expect(302)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.headers.location).to.exist;

        // Test the values make sense
        res.headers.location.should.equal('/');

        done();
      });
  });

  it('GET /my-account — should show me my email', function(done) {
    agent
      .get('/my-account')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text);
        var $container = $('.container');

        // Test the values make sense
        $container.should.have.length.of(1);
        $container.find('h1').text().should.equal('My Account');
        $container.find('h3').eq(0).text().should.equal('Email: test+something@example.com');
        $container.find('h3').eq(1).text().should.equal('Name: Test Something');

        done();
      });
  });

});
