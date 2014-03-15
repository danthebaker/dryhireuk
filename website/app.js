/*
  Module dependencies.
*/

var express = require('express');
var fs = require('fs');

var Mongo = require('digger-mongo');
var DiggerApp = require('digger-app');
var DiggerHTML = require('digger-html-parser');
var Wholesaler = require('wholesaler');
var Ravens = require('ravens');
var basicAuth = require('basic-auth-connect');

var Emailer = require('./emailer');
var Mongo = require('digger-mongo');

var config = require('../config.json');

module.exports = function(options){

	options = options || {};

	var document_root = __dirname + '/www';

	var digger = DiggerApp({
		router:require('./router')(options),
		suppliers:{
			'/wholesaler':Mongo({
				database:options.mongo_database,
				provision:'collection',
				hostname:options.mongo_host,
				port:options.mongo_port
			})
		}
	}).build();

	if(!options.admin_username || !options.admin_password){
		throw new Error('admin_username and admin_password required');
	}

	var admin_auth = basicAuth(options.admin_username, options.admin_password);

	var ravens = Ravens({
		recaptcha_public_key:options.recaptcha_public_key,
		recaptcha_private_key:options.recaptcha_private_key
	})

	var $digger = digger.client;

	var emailer = Emailer(options);

	ravens.on('send', function(formdata){
		emailer('contactform', {
			data:formdata || {}
		});
	})

	var html = DiggerHTML({
		document_root:document_root,
		warehouse:$digger.connect('/website')
	})

	html.on('render', function(path, vars, done){
		vars.shopdata = config.shopdata;
		vars.settings = {
			ravens_key:options.recaptcha_public_key,
			ravens_url:'/ravens',
			business:config.business
		}
		done();
	})

	var wholesaler = Wholesaler({
		users:$digger.connect('/users'),
		stripe:{
			publish_key:options.stripe_publish_key,
			secret_key:options.stripe_secret_key,
			orders:$digger.connect('/wholesaler/orders')
		}
	})

	wholesaler.on('email', function(type, data, done){
		emailer(type, data, done);
	});

	var app = express();

	if(process.env.FORCE_DOMAIN){
		var forceurl = (process.env.FORCE_SSL=='yes' ? 'https://' : 'http://') + process.env.FORCE_DOMAIN;
		app.use(force(forceurl));
	}

	var favico = fs.existsSync(document_root + '/favicon.ico') ? document_root + '/favicon.ico' : null;
	app.use(express.favicon(favico));
	app.use(express.query());
	app.use(express.json());
	app.use(express.urlencoded());

/*
	app.use('/admin', admin_auth, function(req, res, next){
		next();
	});
*/
	app.use('/api/v1', digger.handler);
	app.post('/ravens', ravens.handler())
	app.use(html.handler());


	return app;
}