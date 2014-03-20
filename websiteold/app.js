/*
  Module dependencies.
*/

var express = require('express');
var fs = require('fs');
var Includes = require('html-include');

module.exports = function(options){

	options = options || {};

	var document_root = __dirname + '/www';

	var app = express();

	var favico = fs.existsSync(document_root + '/favicon.ico') ? document_root + '/favicon.ico' : null;
	app.use(express.favicon(favico));
	app.use(express.query());
	app.use(express.json());
	app.use(express.urlencoded());

	var includes = Includes({
		document_root:document_root
	})

	var config = require('../config.json');

	includes.on('page', function(filepath, vars){
		if(filepath.match(/^\/hire/)){
			vars.shopdata = config.shopdata;
		}
	})

	includes.setup(app);
	app.use(includes.serve);

	return app;
}