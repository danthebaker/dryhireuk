var argv = require('optimist').argv;
var App = require('./app');
var http = require('http');
var fs = require('fs');

var port = 80;

var app = App(argv);

http.createServer(app).listen(port, function(){
	console.log('dryhire HTTP website listening: ' + port);
})