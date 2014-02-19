/*
  Module dependencies.
*/

var ecstatic = require('ecstatic');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var url = require('url');

module.exports = function(vars){

	vars = vars || {};

	var fileserver = ecstatic({
		root:path.normalize(__dirname + '/../www')
	})

	function render_html_page(filepath, req, res, params){
		if(!filepath.match(/\./)){
			filepath += '.html';
		}

		fs.stat(path.normalize(__dirname + '/../www' + filepath), function(error, stat){
			if(!error && stat){
				res.render(path.normalize(__dirname + '/../www' + filepath), vars);
			}
			else{
				res.redirect('/');
			}
		})	
	}

	function home_page(req, res){
		render_html_page('/index.html', req, res);
	}

	return {
		home:home_page,
		middleware:function(req, res, next){
			res.renderhtml = function(filepath, data){
				if(!filepath.match(/\.html/)){
					filepath += '.html';
				}
				data = data || {};
				res.render(path.normalize(__dirname + '/../www' + filepath), data);
			}

			next();
		},
		serve:function(req, res, next){
			if(req.url.match(/\.html?$/)){
				render_html_page(url.parse(req.url).pathname, req, res);
			}
			else{
				fileserver(req, res, function(){
					render_html_page(url.parse(req.url).pathname, req, res);
				});
			}
		}
	}
}