
// # <%= _.dasherize(name).split('-').join(' ') %>

var _ = require('underscore')
var _str = require('underscore.string')
_.mixin(_str.exports())

var paginate = require('express-paginate')

exports = module.exports = function(<%= _.classify(name) %>) {

  function index(req, res, next) {
    <%= _.classify(name) %>.paginate({}, req.query.page, req.query.limit, function(err, pageCount, <%= _.camelize(_.pluralize(name)) %>, itemCount) {
      if (err) return next(err)
      res.format({
        html: function() {
          res.render('<%= _.pluralize(_.dasherize(name)) %>', {
            <%= _.camelize(_.pluralize(name)) %>: <%= _.camelize(_.pluralize(name)) %>,
            pageCount: pageCount,
            itemCount: itemCount
          })
        },
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount, <%= _.camelize(_.pluralize(name)) %>.length),
            data: <%= _.camelize(_.pluralize(name)) %>
          })
        }
      })
    })
  }

  function _new(req, res, next) {
    res.render('<%= _.pluralize(_.dasherize(name)) %>/new')
  }

  function create(req, res, next) {
    if (!_.isString(req.body.name) || _.isBlank(req.body.name))
      return next({
        param: 'name',
        message: 'Name is missing or blank'
      })
    <%= _.classify(name) %>.create({
      name: req.body.name
    }, function(err, <%= _.camelize(name) %>) {
      if (err) return next(err)
      res.format({
        html: function() {
          req.flash('success', '<%= _.humanize("Successfully created " + name) %>')
          res.redirect('/<%= _.pluralize(_.dasherize(name)) %>')
        },
        json: function() {
          res.json(<%= _.camelize(name) %>)
        }
      })
    })
  }

  function show(req, res, next) {
    <%= _.classify(name) %>.findById(req.params.id, function(err, <%= _.camelize(name) %>) {
      if (err) return next(err)
      if (!<%= _.camelize(name) %>) return next(new Error('<%= _.humanize(name) %> does not exist'))
      res.format({
        html: function() {
          res.render('<%= _.pluralize(_.dasherize(name)) %>/show', {
            <%= _.camelize(name) %>: <%= _.camelize(name) %>
          })
        },
        json: function() {
          res.json(<%= _.camelize(name) %>)
        }
      })
    })
  }

  function edit(req, res, next) {
    <%= _.classify(name) %>.findById(req.params.id, function(err, <%= _.camelize(name) %>) {
      if (err) return next(err)
      if (!<%= _.camelize(name) %>) return next(new Error('<%= _.humanize(name) %> does not exist'))
      res.render('<%= _.pluralize(_.dasherize(name)) %>/edit', {
        <%= _.camelize(name) %>: <%= _.camelize(name) %>
      })
    })
  }

  function update(req, res, next) {
    <%= _.classify(name) %>.findById(req.params.id, function(err, <%= _.camelize(name) %>) {
      if (err) return next(err)
      if (!<%= _.camelize(name) %>) return next(new Error('<%= _.humanize(name) %> does not exist'))
      if (!_.isString(req.body.name) || _.isBlank(req.body.name))
        return next({
          param: 'name',
          message: 'Name is missing or blank'
        })
      <%= _.camelize(name) %>.name = req.body.name
      <%= _.camelize(name) %>.save(function(err, <%= _.camelize(name) %>) {
        if (err) return next(err)
        res.format({
          html: function() {
            req.flash('success', '<%= _.humanize("Successfully updated " + name) %>')
            res.redirect('/<%= _.pluralize(_.dasherize(name)) %>/' + <%= _.camelize(name) %>.id)
          },
          json: function() {
            res.json(<%= _.camelize(name) %>)
          }
        })
      })
    })
  }

  function destroy(req, res, next) {
    <%= _.classify(name) %>.findById(req.params.id, function(err, <%= _.camelize(name) %>) {
      if (err) return next(err)
      if (!<%= _.camelize(name) %>) return next(new Error('<%= _.humanize(name) %> does not exist'))
      <%= _.camelize(name) %>.remove(function(err) {
        if (err) return next(err)
        res.format({
          html: function() {
            req.flash('success', '<%= _.humanize("Successfully removed " + name) %>')
            res.redirect('/<%= _.pluralize(_.dasherize(name)) %>')
          },
          json: function() {
            // inspired by Stripe's API response for object removals
            res.json({
              id: <%= _.camelize(name) %>.id,
              deleted: true
            })
          }
        })
      })
    })
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
  }

}

exports['@singleton'] = true
exports['@require'] = [ 'models/<%= _.dasherize(name) %>' ]
