/*
  Module dependencies.
*/

var express = require('express');
//var basicAuth = require('basic-auth-connect');
var fs = require('fs');
var Routes = require('./routes');

module.exports = function(options, digger){

	options = options || {};

	var app = express();

	var document_root = __dirname + '/www';
	var view_root = __dirname + '/www';

	app.engine('.html', require('ejs').__express);
	app.set('views', __dirname + '/html');
	app.set('view engine', 'html');

	var favico = fs.existsSync(document_root + '/favicon.ico') ? document_root + '/favicon.ico' : null;
	app.use(express.favicon(favico));
	app.use(express.query());
	app.use(express.json());
	app.use(express.urlencoded());
	
	Routes(app, options, digger);


	return app;
}