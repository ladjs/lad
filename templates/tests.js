
// # tests - <%= _.pluralize(_.dasherize(name)).split('-').join(' ') %>

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

describe('/<%= _.pluralize(_.dasherize(name)) %>', function() {

  var <%= _.classify(name) %> = IoC.create('models/<%= _.dasherize(name) %>');

  // Clean DB and add 3 sample <%= _.pluralize(name) %> before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTest<%= _.classify(_.pluralize(name)) %>(callback) {
        // Create 3 test <%= _.pluralize(name) %>
        async.timesSeries(3, function(i, _callback) {
          var <%= _.camelize(name) %> = new <%= _.classify(name) %>({
            name: '<%= _.classify(name) %> #' + i
          });

          <%= _.camelize(name) %>.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /<%= _.pluralize(_.dasherize(name)) %> - should return 200 if <%= _.camelize(name) %> was created', function(done) {
    request
      .post('/<%= _.pluralize(_.dasherize(name)) %>')
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'Nifty',
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('Nifty');

        // Store this id to use later
        context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /<%= _.pluralize(_.dasherize(name)) %>/:id — should return 200 if <%= _.pluralize(_.dasherize(name)).split('-').join(' ') %> was retrieved', function(done) {
    request
      .get(util.format('/<%= _.pluralize(_.dasherize(name)) %>/%s', context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('Nifty');

        done();
      });
  });

  it('PUT /<%= _.pluralize(_.dasherize(name)) %>/:id - should return 200 if <%= _.pluralize(_.dasherize(name)).split('-').join(' ') %> was updated', function(done) {
    request
      .put(util.format('/<%= _.pluralize(_.dasherize(name)) %>/%s', context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        name: 'NiftyWhoa'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('name');

        // Test the values make sense
        res.body.name.should.equal('NiftyWhoa');

        done();
      });
  });

  it('DELETE /<%= _.pluralize(_.dasherize(name)) %>/:id - should return 200 if <%= _.pluralize(_.dasherize(name)).split('-').join(' ') %> was deleted', function(done) {
    request
      .del(util.format('/<%= _.pluralize(_.dasherize(name)) %>/%s', context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('deleted');

        // Test the values make sense
        res.body.id.should.equal(context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /<%= _.pluralize(_.dasherize(name)) %> - should return 200 if <%= _.pluralize(_.dasherize(name)).split('-').join(' ') %> index loads (JSON)', function(done) {
    request
      .get('/<%= _.pluralize(_.dasherize(name)) %>')
      .accept('application/json')
      .expect(200, done);
  });
  
  it('GET /<%= _.pluralize(_.dasherize(name)) %> - should return 200 if <%= _.pluralize(_.dasherize(name)).split('-').join(' ') %> index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/<%= _.pluralize(_.dasherize(name)) %>')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text)
        var $<%= _.camelize(name) %>List = $('table');
        var $<%= _.camelize(name) %>Rows = $<%= _.camelize(name) %>List.find('tr');

        // Test the values make sense
        $<%= _.camelize(name) %>List.should.have.length.of(1);
        $<%= _.camelize(name) %>Rows.should.have.length.of.at.least(3);

        done();
      });
  });


});