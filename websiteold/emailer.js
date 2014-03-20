var Textmail = require('textmail');
var async = require('async');
var config = require('../config.json');

module.exports = function(options){

	options = options || {};

	var admin_email = config.admin_email;
	var admin_emails = config.admin_emails;
	
	var mailer = Textmail({
		domain:options.mailgun_domain,
		key:options.mailgun_key,
		template_root:__dirname + '/email_templates'
	})

	mailer.on('email', function(email, data){
		
	})

	var templates = {
		purchase:mailer.create('/purchase.ejs', 'Thank you for your DryHire order', admin_emails),
		payment_error:mailer.create('/purchase_error.ejs', 'There was an error with a payment', admin_emails),
		contactform:mailer.create('/contactform.ejs', 'DryHire Contact Form', admin_emails),
	}

	var emails = {
		purchase:function(data, done){

			// send the email to the 'email' property of the data from wholesaler
			templates.purchase(admin_email, data.email, data, done);
		},
		payment_error:function(data, done){
			templates.payment_error(admin_email, data, done);
		},
		contactform:function(data, done){
			templates.contactform(admin_email, data, done);
		}
	}

	return function(type, data, done){
		var email = emails[type];
		if(!email){
			return done('no email for: ' + type);
		}
		email(data, done);
	}
}