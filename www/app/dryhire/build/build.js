
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("ng-toptrump/index.js", function(exports, require, module){
var modulename = module.exports = 'ng-toptrump';

angular
  .module(modulename, [

  ])

  .directive('toptrump', function(){
    
    return {
      restrict:'EA',
      scope:{
        data:'=',
        fields:'=',
        name:'@',
        image:'@'
      },
      template: require('./template'),
      transclude: true,
      replace: true,
      link:function($scope){

        $scope.getimage = function(){
          if($scope.data && $scope.data[$scope.image]){
            return $scope.data[$scope.image];
          }
        }

        $scope.getvalue = function(field){
          if(typeof(field.value)=='string'){
            return $scope.data ? $scope.data[field.value] : null;
          }
          else if(typeof(field.value)=='function'){
            return field.value($scope.data);
          }
        }
      }
    };
  })

});
require.register("ng-toptrump/template.js", function(exports, require, module){
module.exports = '<div class="toptrump-card">\n    <div style="margin:5px;" ng-transclude></div>\n    <table border=0 class="toptrump-table">\n        <tr ng-repeat="field in fields">\n            <td align="left" valign="top" class="toptrump-td"><strong>{{ field.title }}:</strong></td>\n            <td>&nbsp;</td>\n            <td align="left" valign="top" class="toptrump-td">{{ getvalue(field) }}</td>\n        </tr>\n    </table>\n</div>';
});
require.register("dryhire/index.js", function(exports, require, module){
var modulename = module.exports = 'dryhire';

angular
  .module(modulename, [
  	require('ng-toptrump')
  ])

  // the data baked into the page from the server
  .factory('$data', function(){
    return window._data || {};
  })

  // the shop part of the data above
  .factory('$shopdata', function($data){
    return $data ? ($data.shopdata || {}) : {}
  })

  .controller('HireCtrl', function($scope, $shopdata, $location, $rootScope, $anchorScroll){
    $scope.shopdata = $shopdata;
    $scope.toptrump_fields = [{
      title:'Brand',
      value:'company'
    },{
      title:'Capacity',
      value:'capacity'
    },{
      title:'Desc',
      value:'description'
    }]

    $scope.selected = null;

    function itemid(item){
      return item.name.replace(/\W/g, '').toLowerCase();
    }

    $scope.selecthire = function(item){
      $scope.selected = item;
      $location.path(itemid(item));
    }

    $scope.resethire = function(){
      $scope.selected = null;
      $location.path('');
    }

    $scope.hidecontrol = function(){
      $scope.selected = null;
    }

    var userSections = {
      landlords:true,
      commercial:true,
      domestic:true,
      trade:true
    }

    $rootScope.$on('$locationChangeSuccess', function(event){
      var id = $location.path().replace(/^\//, '');

      if($location.path()=='/'){
        $scope.selected = null;
      }
      else if(userSections[id]){
        $location.path('/');
        $location.hash(id)
        $anchorScroll();
      }
      else{
        var matching = $scope.shopdata.dehumidifers.filter(function(item){
          return itemid(item)==id;
        })
        if(matching.length){
          $scope.selected = matching[0];
        }
        else{
          $scope.selected = null;
        }
      }
    })
  })
});
require.alias("ng-toptrump/index.js", "dryhire/deps/ng-toptrump/index.js");
require.alias("ng-toptrump/template.js", "dryhire/deps/ng-toptrump/template.js");
require.alias("ng-toptrump/index.js", "dryhire/deps/ng-toptrump/index.js");
require.alias("ng-toptrump/index.js", "ng-toptrump/index.js");
require.alias("ng-toptrump/index.js", "ng-toptrump/index.js");
require.alias("dryhire/index.js", "dryhire/index.js");