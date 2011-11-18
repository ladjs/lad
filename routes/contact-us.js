
// # Contact Us

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate;

module.exports = function(app, db) {

  // ## Contact us form
  app.get('/contact-us', function(req, res) {
    res.render('contact-us', {
      title: "Contact Us",
    });
  });

  // ## Process contact form
  app.post('/contact-us', form(
        filter("name").trim()
      , validate("name").required()
      , filter("address").trim()
      , filter("city_state_zip").trim()
      , filter("email").trim()
      , validate("email").required().isEmail()
      , filter("daytime_phone").trim()
      , validate("daytime_phone").required()
      , filter("comments").trim()
    ),
    function(req, res) {
      if(!req.form.isValid) {
        res.render('/contact-us', {
          title: "Contact Us",
          form: req.form
        });
      } else {
        // Dispatch email
        var nodemailer = require('nodemailer')
          , emailSignature = require('../lib/email-signature')
          , htmlMsg = ''
              + '<p>New form submission on your website:</p>'
              + '<ul>'
              + '<li><strong>Name:</strong> ' + req.form.name + '</li>'
              + '<li><strong>Address:</strong> ' + req.form.address + '</li>'
              + '<li><strong>City, State, ZIP:</strong> ' + req.form.city_state_zip + '</li>'
              + '<li><strong>Email:</strong> ' + req.form.email + '</li>'
              + '<li><strong>Daytime Phone #:</strong> ' + req.form.daytime_phone + '</li>'
              + '<li><strong>Comments:</strong><br />'
              + '     ' + req.form.comments
              + '</li>'
              + '</ul>'
              + emailSignature("html")
          , plainMsg = ''
              + 'New form submission on your website:\n\n'
              + 'Name: ' + req.form.name + '\n\n'
              + 'Address: ' + req.form.address + '\n\n'
              + 'City, State, ZIP: ' + req.form.city_state_zip + '\n\n'
              + 'Email: ' + req.form.email + '\n\n'
              + 'Daytime Phone #: ' + req.form.daytime_phone + '\n\n'
              + 'Comments: \n\n' + req.form.comments + '\n\n'
              + emailSignature("text");
        nodemailer.SMTP = {
            host: 'smtp.gmail.com'
          , port: 465
          , ssl: true
          , use_authentication: true
          , user: 'llamas@yourdomain.com'
          , pass: 'alpacas'
        };
        nodemailer.send_mail(
          {
              sender: '"Llamas" <llamas@yourdomain.com>'
            , to: '"Expressling" <hello@expressling.com>'
            , reply_to: '"' + req.form.name + '" <' + req.form.email + '>'
            , subject: 'New form submission on your website'
            , html: htmlMsg
            , body: plainMsg
          },
          function(err, success) {
            if(success) {
              req.flash('success', ''
                + 'Thank you ' + req.form.name + ', an email has been sent to '
                + 'us with your inquiry.  We will reply within 24-48 hours.');
            } else {
              req.flash('error', 'An error occured, please try again');
            }
            res.redirect('/contact-us');
          }
        );
      }
    }
  );

};
