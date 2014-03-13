var Client = require('digger-client');
var Bridge = require('digger-bridge');

module.exports = function(options){
	var handler = Bridge('/api/v1');
	var $digger = Client(options);

	$digger.on('request', handler);
	$digger.on('radio', function(){
		console.log('radio not implemented');
	})

	return $digger;
}