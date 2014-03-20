module.exports = function digger_router(config){

	function handle(req, reply, next){

		var user = req.headers['x-json-user'];

		/*
		
			allow internal users to do whatever
			
		*/
		if(req.internal && !user){
			user = {
				_internal:true
			}
			next();
			return;
		}

		next();
	}

	return handle;
}
