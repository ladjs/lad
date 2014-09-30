// # tests - <%= _.dasherize(name).split('-').join(' ') %>

var util = require('util')
var request = require('supertest')
var app = require('../app')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect
var utils = require('./utils')
var async = require('async')
var IoC = require('electrolyte')

chai.should()
chai.use(sinonChai)

request = request(app)

// storage for context-specific variables throughout the tests
var context = {};

describe('/<%= _.pluralize(_.dasherize(name)) %>', function() {

  var <%= _.classify(name) %> = IoC.create('models/<%= _.dasherize(name) %>')

  // Clean DB and add 3 sample <%= _.pluralize(name) %> before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTest<%= _.classify(_.pluralize(name)) %>(callback) {
        // Create 3 test <%= _.pluralize(name) %>
        async.timesSeries(3, function(i, _callback) {
          var <%= _.camelize(name) %> = new <%= _.classify(name) %>({
            name: '<%= _.classify(name) %> #' + i
          })

          <%= _.camelize(name) %>.save(_callback)
        }, callback)
      }
    ], done)
  })

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done)
  })

  it('POST /<%= _.camelize(_.pluralize(name)) %> - should return 200 if <%= _.camelize(name) %> was created', function(done) {
    request
      .post('/<%= _.camelize(_.pluralize(name)) %>')
      .accept('application/json')
      .send({
        name: 'Nifty',
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id')
        res.body.should.have.property('name')

        // Test the values make sense
        res.body.name.should.equal('Nifty')

        // Store this id to use later
        context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest = res.body.id

        done()
      })
  })

  it('GET /<%= _.camelize(_.pluralize(name)) %>/:id — should return 200 if <%= _.pluralize(_.dasherize(name)) %> was retrieved', function(done) {
    request
      .get(util.format('/<%= _.camelize(_.pluralize(name)) %>/%s', context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id')
        res.body.should.have.property('name')

        // Test the values make sense
        res.body.name.should.equal('Nifty')

        done()
      })
  })

  it('PUT /<%= _.camelize(_.pluralize(name)) %>/:id - should return 200 if <%= _.pluralize(_.dasherize(name)) %> was updated', function(done) {
    request
      .put(util.format('/<%= _.camelize(_.pluralize(name)) %>/%s', context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest))
      .accept('application/json')
      .send({
        name: 'NiftyWhoa'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id')
        res.body.should.have.property('name')

        // Test the values make sense
        res.body.name.should.equal('NiftyWhoa')

        done()
      })
  })

  it('DELETE /<%= _.camelize(_.pluralize(name)) %>/:id - should return 200 if <%= _.pluralize(_.dasherize(name)) %> was deleted', function(done) {
    request
      .del(util.format('/<%= _.camelize(_.pluralize(name)) %>/%s', context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id')
        res.body.should.have.property('deleted')

        // Test the values make sense
        res.body.id.should.equal(context.<%= _.camelize(_.pluralize(name)) %>IdCreatedWithRequest)
        res.body.deleted.should.equal(true)

        done()
      })
  })

  it('GET /<%= _.camelize(_.pluralize(name)) %> - should return 200 if <%= _.pluralize(_.dasherize(name)) %> index loads', function(done) {
    request
      .get('/<%= _.camelize(_.pluralize(name)) %>')
      .accept('application/json')
      .expect(200, done)
  })

})