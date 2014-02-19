/*
  Module dependencies.
*/

var ecstatic = require('ecstatic');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var url = require('url');
var Fileserver = require('./fileserver');

module.exports = function(app, options){

	var files = Fileserver({
		
	});


	app.use(files.middleware)
	
	app.get('/', files.home);

	app.get('/index', files.home);
	app.get('/index.html', files.home);

	app.use(app.router);
	app.use(files.serve);
}