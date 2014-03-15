var argv = require('optimist').argv;
var App = require('./app');
var http = require('http');
var port = argv.port || 80;

var settings = {
	mongo_host:process.env.MONGO_PORT_27017_TCP_ADDR,
	mongo_port:process.env.MONGO_PORT_27017_TCP_PORT,
	mongo_database:'dryhire',
	recaptcha_public_key:process.env.RECAPTCHA_PUBLIC_KEY,
	recaptcha_private_key:process.env.RECAPTCHA_PRIVATE_KEY,
	stripe_publish_key:process.env.STRIPE_PUBLISH_KEY,
	stripe_secret_key:process.env.STRIPE_SECRET_KEY,
	mailgun_domain:process.env.MAILGUN_DOMAIN,
	mailgun_key:process.env.MAILGUN_KEY,
	admin_username:process.env.ADMIN_USERNAME,
	admin_password:process.env.ADMIN_PASSWORD
}

Object.keys(settings).forEach(function(prop){
	if(!settings[prop]){
		throw new Error(prop + ' setting needed');
	}
})

var app = App(settings);

http.createServer(app).listen(port, function(){
	console.log('dryhire HTTP website listening: ' + port);
})

/*
if(argv.ssl){
	var options = {
	  key: fs.readFileSync(__dirname + '/keys/production/www.funkybod.com.nopass.key').toString(),
	  cert: fs.readFileSync(__dirname + '/keys/production/www_funkybod_com.crt').toString()
	}
	https.createServer(options,app).listen(sslport, function(){
	  console.log('funkybods HTTPS website listening: ' + sslport);
	});
}*/