var modulename = module.exports = 'ng-randomid';

angular
  .module(modulename, [])

  .factory('$randomid', function(){
    return function(chars){

      chars = chars || 6;

      var pattern = '';

      for(var i=0; i<chars; i++){
        pattern += 'x';
      }
      
      return pattern.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    }
  })