
// # tests - users

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

describe('/users', function() {

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

  it('POST /users - should return 200 if user was created', function(done) {
    this.timeout(3000); // The first request sometimes takes longer to complete

    request
      .post('/users')
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        email: util.format('niftylettuce+%s@gmail.com', new Date().getTime()),
        name: 'Nifty',
        surname: 'Lettuce',
        password: 'abc123'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');
        res.body.should.have.property('surname');
        res.body.should.not.have.property('password');

        // Test the values make sense
        res.body.name.should.equal('Nifty');
        res.body.surname.should.equal('Lettuce');

        // Store this id to use later
        context.userIdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /users/:id — should return 200 if user was retrieved', function(done) {
    request
      .get(util.format('/users/%s', context.userIdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');
        res.body.should.have.property('surname');
        res.body.should.not.have.property('password');

        // Test the values make sense
        res.body.name.should.equal('Nifty');
        res.body.surname.should.equal('Lettuce');

        done();
      });
  });

  it('PUT /users/:id - should return 200 if user was updated', function(done) {
    request
      .put(util.format('/users/%s', context.userIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'NiftyWhoa',
        email: 'niftywhoa@gmail.com',
        surname: 'LettuceWhoa'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('email');
        res.body.should.have.property('name');
        res.body.should.have.property('surname');

        // Test the values make sense
        res.body.email.should.equal('niftywhoa@gmail.com');
        res.body.name.should.equal('NiftyWhoa');
        res.body.surname.should.equal('LettuceWhoa');

        done();
      });
  });

  it('DELETE /users/:id - should return 200 if user was deleted', function(done) {
    request
      .del(util.format('/users/%s', context.userIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('deleted');

        // Test the values make sense
        res.body.id.should.equal(context.userIdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /users - should return 200 if user index loads (JSON)', function(done) {
    request
      .get('/users')
      .accept('application/json')
      .expect(200, done);
  });

  it('GET /users - should return 200 if user index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/users')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text);
        var $userList = $('table');
        var $userRows = $userList.find('tr');

        // Test the values make sense
        $userList.should.have.length.of(1);
        $userRows.should.have.length.of.at.least(3);

        done();
      });
  });

});
