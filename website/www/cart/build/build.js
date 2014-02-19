
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
 * Main definitions.
 */

require.mains = {};

/**
 * Define a main.
 */

require.main = function(name, path){
  require.mains[name] = path;
};

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
  if ('/' == path.charAt(0)) path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  if (require.mains[path]) {
    paths = [path + '/' + require.mains[path]];
  }

  for (var i = 0, len = paths.length; i < len; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) {
      return path;
    }
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

  for (var i = 0, len = path.length; i < len; ++i) {
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
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var root = require.normalize(parent, '..');

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
    if ('.' == c) return require.normalize(root, path);
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
require.register("binocarlos-cornershop/index.js", function(exports, require, module){
function Shop(name, autoload){
	this.name = name;
	this.items = [];
	this.extras = {};
	this.settings = {};
	if(autoload){
		this.load();
	}
}

module.exports = Shop;

Shop.prototype.reset = function(item){
	this.items = [];
	this.extras = {};
	this.settings = {};
}


Shop.prototype.addItem = function(item){

	if(!item){
		return;
	}

	if(!item.qty){
		item.qty = 1;
	}
	
	var hit = null;

	this.items.forEach(function(i){
		if((i.name==item.name || i.id==item.id) && !hit){
			hit = true;
			i.qty += item.qty;
		}
	})

	if(!hit){
		this.items.push(item);	
	}
}

Shop.prototype.getItem = function(id){
	var items = this.items.filter(function(item){
		return item.id==id;
	})
	return items.length>0 ? items[0] : null;
}

Shop.prototype.removeItem = function(id){
	this.items = this.items.filter(function(item){
		return item.id!=id;
	})
}

Shop.prototype.getTotal = function(plusextras){
	var total = 0;
	var self = this;
	this.items.forEach(function(item){
		total+=(item.price||0)*(item.qty||0);
	})

	if(plusextras){
		total+=this.getExtraTotal();
	}

	return total;
}

Shop.prototype.load = function(){
	var string = localStorage != null ? localStorage[this.name + "_cornershop"] : null;
	if(string){
		try {
			var data = JSON.parse(string);
      this.items = data.items || [];
      this.settings = data.settings || {};
      this.extras = data.extras || {};
    }
    catch (err) {

    }
	}
}

Shop.prototype.toJSON = function(){
	return {
  	items:this.items,
  	extras:this.extras,
  	settings:this.settings
  }
}

Shop.prototype.save = function(){
	if (localStorage != null){
    localStorage[this.name + "_cornershop"] = JSON.stringify(this.toJSON());
  }
}

Shop.prototype.setting = function(name, val){
	if(arguments.length>=2){
		this.settings[name] = val;
	}
	return this.settings[name];
}

Shop.prototype.setExtra = function(field, obj){
	obj.id = field;
	this.extras[field] = obj;
}

Shop.prototype.getExtra = function(field){
	return this.extras[field];
}

Shop.prototype.getExtras = function(){
	var self = this;
	return Object.keys(this.extras || {}).map(function(prop){
		return self.extras[prop];
	})
}

Shop.prototype.removeExtra = function(field, obj){
	delete(this.extras[field]);
}


Shop.prototype.getExtraTotal = function(){
	var self = this;
	var total = 0;
	Object.keys(this.extras).forEach(function(prop){
		var extra = self.extras[prop];
		total+=((extra.price || 0) * (extra.qty || 1));
	})
	return total;
}

Shop.prototype.qty = function(){
	var total = 0;

	this.items.forEach(function(item){
		total += item.qty || 0;
	})

	return total;
}


module.exports = function(name, autoload){
	return new Shop(name, autoload);
}

module.exports.Class = Shop;
});
require.register("binocarlos-ng-safe/index.js", function(exports, require, module){
var modulename = module.exports = 'ng-safe';

angular
  .module(modulename, [])

  .factory('$safeApply', [function() {
    return function($scope, fn) {
      var phase = $scope.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if (fn) {
          $scope.$eval(fn);
        }
      } else {
        if (fn) {
          $scope.$apply(fn);
        } else {
          $scope.$apply();
        }
      }
    }
  }])
});
require.register("binocarlos-ng-randomid/index.js", function(exports, require, module){
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
});
require.register("binocarlos-ng-country/index.js", function(exports, require, module){
var modulename = module.exports = 'ng-country';

var countries = [{"name":"Afghanistan","region":"Asia"},{"name":"Åland Islands","region":"Europe"},{"name":"Albania","region":"Europe"},{"name":"Algeria","region":"Africa"},{"name":"American Samoa","region":"Oceania"},{"name":"Andorra","region":"Europe"},{"name":"Angola","region":"Africa"},{"name":"Anguilla","region":"Americas"},{"name":"Antarctica","region":""},{"name":"Antigua and Barbuda","region":"Americas"},{"name":"Argentina","region":"Americas"},{"name":"Armenia","region":"Asia"},{"name":"Aruba","region":"Americas"},{"name":"Australia","region":"Oceania"},{"name":"Austria","region":"Europe"},{"name":"Azerbaijan","region":"Asia"},{"name":"Bahamas","region":"Americas"},{"name":"Bahrain","region":"Asia"},{"name":"Bangladesh","region":"Asia"},{"name":"Barbados","region":"Americas"},{"name":"Belarus","region":"Europe"},{"name":"Belgium","region":"Europe"},{"name":"Belize","region":"Americas"},{"name":"Benin","region":"Africa"},{"name":"Bermuda","region":"Americas"},{"name":"Bhutan","region":"Asia"},{"name":"Bolivia","region":"Americas"},{"name":"Bonaire","region":"Americas"},{"name":"Bosnia and Herzegovina","region":"Europe"},{"name":"Botswana","region":"Africa"},{"name":"Bouvet Island","region":""},{"name":"Brazil","region":"Americas"},{"name":"British Indian Ocean Territory","region":"Africa"},{"name":"British Virgin Islands","region":"Americas"},{"name":"Brunei","region":"Asia"},{"name":"Bulgaria","region":"Europe"},{"name":"Burkina Faso","region":"Africa"},{"name":"Burundi","region":"Africa"},{"name":"Cambodia","region":"Asia"},{"name":"Cameroon","region":"Africa"},{"name":"Canada","region":"Americas"},{"name":"Cape Verde","region":"Africa"},{"name":"Cayman Islands","region":"Americas"},{"name":"Central African Republic","region":"Africa"},{"name":"Chad","region":"Africa"},{"name":"Chile","region":"Americas"},{"name":"China","region":"Asia"},{"name":"Christmas Island","region":"Oceania"},{"name":"Cocos (Keeling) Islands","region":"Oceania"},{"name":"Colombia","region":"Americas"},{"name":"Comoros","region":"Africa"},{"name":"Republic of the Congo","region":"Africa"},{"name":"Democratic Republic of the Congo","region":"Africa"},{"name":"Cook Islands","region":"Oceania"},{"name":"Costa Rica","region":"Americas"},{"name":"Côte d'Ivoire","region":"Africa"},{"name":"Croatia","region":"Europe"},{"name":"Cuba","region":"Americas"},{"name":"Curaçao","region":"Americas"},{"name":"Cyprus","region":"Asia"},{"name":"Czech Republic","region":"Europe"},{"name":"Denmark","region":"Europe"},{"name":"Djibouti","region":"Africa"},{"name":"Dominica","region":"Americas"},{"name":"Dominican Republic","region":"Americas"},{"name":"Ecuador","region":"Americas"},{"name":"Egypt","region":"Africa"},{"name":"El Salvador","region":"Americas"},{"name":"Equatorial Guinea","region":"Africa"},{"name":"Eritrea","region":"Africa"},{"name":"Estonia","region":"Europe"},{"name":"Ethiopia","region":"Africa"},{"name":"Falkland Islands","region":"Americas"},{"name":"Faroe Islands","region":"Europe"},{"name":"Fiji","region":"Oceania"},{"name":"Finland","region":"Europe"},{"name":"France","region":"Europe"},{"name":"French Guiana","region":"Americas"},{"name":"French Polynesia","region":"Oceania"},{"name":"French Southern and Antarctic Lands","region":""},{"name":"Gabon","region":"Africa"},{"name":"Gambia","region":"Africa"},{"name":"Georgia","region":"Asia"},{"name":"Germany","region":"Europe"},{"name":"Ghana","region":"Africa"},{"name":"Gibraltar","region":"Europe"},{"name":"Greece","region":"Europe"},{"name":"Greenland","region":"Americas"},{"name":"Grenada","region":"Americas"},{"name":"Guadeloupe","region":"Americas"},{"name":"Guam","region":"Oceania"},{"name":"Guatemala","region":"Americas"},{"name":"Guernsey","region":"Europe"},{"name":"Guinea","region":"Africa"},{"name":"Guinea-Bissau","region":"Africa"},{"name":"Guyana","region":"Americas"},{"name":"Haiti","region":"Americas"},{"name":"Heard Island and McDonald Islands","region":""},{"name":"Vatican City","region":"Europe"},{"name":"Honduras","region":"Americas"},{"name":"Hong Kong","region":"Asia"},{"name":"Hungary","region":"Europe"},{"name":"Iceland","region":"Europe"},{"name":"India","region":"Asia"},{"name":"Indonesia","region":"Asia"},{"name":"Iran","region":"Asia"},{"name":"Iraq","region":"Asia"},{"name":"Ireland","region":"Europe"},{"name":"Isle of Man","region":"Europe"},{"name":"Israel","region":"Asia"},{"name":"Italy","region":"Europe"},{"name":"Jamaica","region":"Americas"},{"name":"Japan","region":"Asia"},{"name":"Jersey","region":"Europe"},{"name":"Jordan","region":"Asia"},{"name":"Kazakhstan","region":"Asia"},{"name":"Kenya","region":"Africa"},{"name":"Kiribati","region":"Oceania"},{"name":"Kuwait","region":"Asia"},{"name":"Kyrgyzstan","region":"Asia"},{"name":"Laos","region":"Asia"},{"name":"Latvia","region":"Europe"},{"name":"Lebanon","region":"Asia"},{"name":"Lesotho","region":"Africa"},{"name":"Liberia","region":"Africa"},{"name":"Libya","region":"Africa"},{"name":"Liechtenstein","region":"Europe"},{"name":"Lithuania","region":"Europe"},{"name":"Luxembourg","region":"Europe"},{"name":"Macau","region":"Asia"},{"name":"Macedonia","region":"Europe"},{"name":"Madagascar","region":"Africa"},{"name":"Malawi","region":"Africa"},{"name":"Malaysia","region":"Asia"},{"name":"Maldives","region":"Asia"},{"name":"Mali","region":"Africa"},{"name":"Malta","region":"Europe"},{"name":"Marshall Islands","region":"Oceania"},{"name":"Martinique","region":"Americas"},{"name":"Mauritania","region":"Africa"},{"name":"Mauritius","region":"Africa"},{"name":"Mayotte","region":"Africa"},{"name":"Mexico","region":"Americas"},{"name":"Micronesia","region":"Oceania"},{"name":"Moldova","region":"Europe"},{"name":"Monaco","region":"Europe"},{"name":"Mongolia","region":"Asia"},{"name":"Montenegro","region":"Europe"},{"name":"Montserrat","region":"Americas"},{"name":"Morocco","region":"Africa"},{"name":"Mozambique","region":"Africa"},{"name":"Myanmar","region":"Asia"},{"name":"Namibia","region":"Africa"},{"name":"Nauru","region":"Oceania"},{"name":"Nepal","region":"Asia"},{"name":"Netherlands","region":"Europe"},{"name":"New Caledonia","region":"Oceania"},{"name":"New Zealand","region":"Oceania"},{"name":"Nicaragua","region":"Americas"},{"name":"Niger","region":"Africa"},{"name":"Nigeria","region":"Africa"},{"name":"Niue","region":"Oceania"},{"name":"Norfolk Island","region":"Oceania"},{"name":"North Korea","region":"Asia"},{"name":"Northern Mariana Islands","region":"Oceania"},{"name":"Norway","region":"Europe"},{"name":"Oman","region":"Asia"},{"name":"Pakistan","region":"Asia"},{"name":"Palau","region":"Oceania"},{"name":"Palestine","region":"Asia"},{"name":"Panama","region":"Americas"},{"name":"Papua New Guinea","region":"Oceania"},{"name":"Paraguay","region":"Americas"},{"name":"Peru","region":"Americas"},{"name":"Philippines","region":"Asia"},{"name":"Pitcairn Islands","region":"Oceania"},{"name":"Poland","region":"Europe"},{"name":"Portugal","region":"Europe"},{"name":"Puerto Rico","region":"Americas"},{"name":"Qatar","region":"Asia"},{"name":"Republic of Kosovo","region":"Europe"},{"name":"Réunion","region":"Africa"},{"name":"Romania","region":"Europe"},{"name":"Russia","region":"Europe"},{"name":"Rwanda","region":"Africa"},{"name":"Saint Barthélemy","region":"Americas"},{"name":"Saint Helena","region":"Africa"},{"name":"Saint Kitts and Nevis","region":"Americas"},{"name":"Saint Lucia","region":"Americas"},{"name":"Saint Martin","region":"Americas"},{"name":"Saint Pierre and Miquelon","region":"Americas"},{"name":"Saint Vincent and the Grenadines","region":"Americas"},{"name":"Samoa","region":"Oceania"},{"name":"San Marino","region":"Europe"},{"name":"São Tomé and Príncipe","region":"Africa"},{"name":"Saudi Arabia","region":"Asia"},{"name":"Senegal","region":"Africa"},{"name":"Serbia","region":"Europe"},{"name":"Seychelles","region":"Africa"},{"name":"Sierra Leone","region":"Africa"},{"name":"Singapore","region":"Asia"},{"name":"Sint Maarten","region":"Americas"},{"name":"Slovakia","region":"Europe"},{"name":"Slovenia","region":"Europe"},{"name":"Solomon Islands","region":"Oceania"},{"name":"Somalia","region":"Africa"},{"name":"South Africa","region":"Africa"},{"name":"South Georgia","region":"Americas"},{"name":"South Korea","region":"Asia"},{"name":"South Sudan","region":"Africa"},{"name":"Spain","region":"Europe"},{"name":"Sri Lanka","region":"Asia"},{"name":"Sudan","region":"Africa"},{"name":"Suriname","region":"Americas"},{"name":"Svalbard and Jan Mayen","region":"Europe"},{"name":"Swaziland","region":"Africa"},{"name":"Sweden","region":"Europe"},{"name":"Switzerland","region":"Europe"},{"name":"Syria","region":"Asia"},{"name":"Taiwan","region":"Asia"},{"name":"Tajikistan","region":"Asia"},{"name":"Tanzania","region":"Africa"},{"name":"Thailand","region":"Asia"},{"name":"Timor-Leste","region":"Asia"},{"name":"Togo","region":"Africa"},{"name":"Tokelau","region":"Oceania"},{"name":"Tonga","region":"Oceania"},{"name":"Trinidad and Tobago","region":"Americas"},{"name":"Tunisia","region":"Africa"},{"name":"Turkey","region":"Asia"},{"name":"Turkmenistan","region":"Asia"},{"name":"Turks and Caicos Islands","region":"Americas"},{"name":"Tuvalu","region":"Oceania"},{"name":"Uganda","region":"Africa"},{"name":"Ukraine","region":"Europe"},{"name":"United Arab Emirates","region":"Asia"},{"name":"United Kingdom","region":"Europe"},{"name":"United States","region":"Americas"},{"name":"United States Minor Outlying Islands","region":"Americas"},{"name":"United States Virgin Islands","region":"Americas"},{"name":"Uruguay","region":"Americas"},{"name":"Uzbekistan","region":"Asia"},{"name":"Vanuatu","region":"Oceania"},{"name":"Venezuela","region":"Americas"},{"name":"Vietnam","region":"Asia"},{"name":"Wallis and Futuna","region":"Oceania"},{"name":"Western Sahara","region":"Africa"},{"name":"Yemen","region":"Asia"},{"name":"Zambia","region":"Africa"},{"name":"Zimbabwe","region":"Africa"}]

angular
  .module(modulename, [])

  .factory('$countries', function(){
    return countries;
  })

});
require.register("binocarlos-ng-cornershop/index.js", function(exports, require, module){
var modulename = module.exports = 'ng-cornershop';
var CornerShop = require("binocarlos-cornershop");

angular
  .module(modulename, [
    require("binocarlos-ng-safe"),
    require("binocarlos-ng-randomid"),
    require("binocarlos-ng-country")
  ])

  .factory('$cornershop', function(){
    return CornerShop;
  })

  .factory('$paypaldesc', function(){
    return function(cart){
      var items = cart.items.map(function(item){
        return item.qty + ' x ' + item.name;
      })

      return items.join(" - ") + ' + shipping (' + (cart.getExtraTotal() || 0) + ')';
      //return qty + ' ' + title + (qty>1 ? 's' : '') + '(' + cart.getTotal() + ') + shipping (' + (cart.getExtraTotal() || 0) + ')';
    }
  })

  // the small desc for stripe
  .factory('$cartdesc', function(){
    return function(cart, title){
      var qty = 0;
      title = title || 'item';
      var items = cart.items.map(function(item){
        qty += item.qty;
      })

      return qty + ' ' + title + (qty>1 ? 's' : '') + '(' + cart.getTotal() + ') + shipping (' + (cart.getExtraTotal() || 0) + ')';
    }
  })

  .factory('$fullcartdesc', function(){
    return function(cart){
      var items = cart.items.map(function(item){
        return item.qty + ' x ' + item.desc;
      })

      items = items.concat(cart.getExtras().map(function(extra){
        return extra.id + ': ' + extra.name + ' ' + extra.price;
      }))

      return items.join("\n");  
    }
  })

  .directive('checkout', function($http, $cartdesc, $fullcartdesc, $paypaldesc){
    
    return {
      restrict:'EA',
      scope:{
        cart:'=',
        settings:'=',
        shipping:'=',
        labels:'='
      },
      template: require("./templates/checkout"),
      replace: true,
      link:function($scope, elem, $attr){

        $scope.stripedetails = null;
        $scope.paypaldetails = null;

        $scope.address = $scope.cart.setting('address') || {};

        $scope.$watch('address', function(address){
          $scope.cart.setting('address', address);
          $scope.cart.save();
        }, true)

        $scope.stripedetails = null;

        $scope.$on('payment:stripe', function($ev, details){
          $scope.stripedetails = details;
        })

        $scope.$on('payment:paypal', function($ev, details){
          $scope.paypaldetails = details;
        })

        $scope.stripedetails = null;

        $scope.$on('payment:error', function($ev, errortext){
          $scope.error = errortext;
        })

        // this is to send the stripe details to the server
        $scope.stripepurchase = function(){

          if(!$scope.stripedetails){
            return;
          }

          var errortext = null;

          ['name', 'line1', 'city', 'state', 'zip', 'country'].forEach(function(field){

            if(!$scope.address[field]){
              errortext = 'please enter the address - ' + field;
            }

          })

          if(errortext){
            $scope.error = errortext;
            return;
          }

          $scope.inprogress = true;

          $http({
            method: 'POST',
            url: $scope.settings.stripe_checkout_url,
            data:{
              notes:$fullcartdesc($scope.cart),
              desc:$paypaldesc($scope.cart),
              stripe:$scope.stripedetails,
              cart:$scope.cart.toJSON(),
              amount:Math.round($scope.cart.getTotal(true)*100)/100
            }
          })
          .success(function(data, status, headers, config) {
            //$scope.inprogress = false;
            document.location = '/checkout.html';
          })
          .error(function(data, status, headers, config) {
            $scope.inprogress = false;
            $scope.error = data || 'there was an error';
          })

        }
      }
    };
  })

  .directive('paypalButton', function($cartdesc, $fullcartdesc, $paypaldesc, $http){
    
    return {
      restrict:'EA',
      scope:{
        title:'@',
        settings:'=',
        cart:'=',
        address:'='
      },
      template: require("./templates/paypal_button"),
      replace: true,
      link:function($scope, elem, $attr){
        $scope.$cartdesc = $cartdesc;
        $scope.$paypaldesc = $paypaldesc;

        elem.attr('action', $scope.settings.paypal_link);

        $scope.dopaypal = function(){
          $http({
            method: 'POST',
            url: $scope.settings.paypal_stash_url,
            data:{
              notes:$fullcartdesc($scope.cart),
              desc:$cartdesc($scope.cart),
              cart:$scope.cart.toJSON(),
              amount:Math.round($scope.cart.getTotal(true)*100)/100
            }
          })
          .success(function(data, status, headers, config) {

            $scope.stashid = data.id;
            setTimeout(function(){
              $('#paypal_form').submit();
            }, 500)
            
          })
          .error(function(data, status, headers, config) {

            $scope.$emit('payment:error', data);
          })
        }

      }
    };
  })

  .directive('stripeButton', function($safeApply, $cartdesc){
    return {
      restrict:'EA',
      scope:{
        title:'@',
        settings:'=',
        cart:'=',
        address:'='
      },
      template: require("./templates/stripebutton"),
      replace: true,
      controller:function($scope){

        

        var stripe_handler = StripeCheckout.configure({
          key:$scope.settings.stripe_publish_key,
          token:function(token, args){
            $safeApply($scope, function(){
              $scope.$emit('payment:stripe', token);
              $scope.stripedetails = token;
            })
          }
        })

        $scope.clickstripe = function(){
          stripe_handler.open({
            name: $scope.settings.shop_name,
            description: $cartdesc($scope.cart),
            currency:'GBP',
            amount: Math.ceil($scope.cart.getTotal(true) * 100)
          });
        }



      }
    };
  })


  .directive('shippingOptions', function(){
    
    return {
      restrict:'EA',
      scope:{
        cart:'=',
        shipping_destinations:'=shipping'
      },
      template: require("./templates/shippingoptions"),
      replace: true,
      link:function($scope, $elem){

        $scope.choosenshipping = $scope.cart.setting('baseshipping') || null;

        if($scope.choosenshipping){
          $scope.choosencost = $scope.choosenshipping.price;  
        }

        $scope.$on('shipping:force', function(ev, shipping){
          $scope.setshipping(shipping);
        })
        
        $scope.setshipping = function(shipping){

          $scope.$emit('cart:shipping', shipping);
          $scope.choosenshipping = shipping;
          $scope.choosencost = shipping.price;
        }

        if(!$scope.choosenshipping){
          $scope.setshipping($scope.shipping_destinations[0]);
        }
      }
    };
  })

  .directive('cartDropdown', function(){
    
    return {
      restrict:'EA',
      scope:{
        cart:'='
      },
      template: require("./templates/cartdropdown"),
      replace: true,
      link:function($scope, elem, $attr){
        $scope.clear = function(){
          $scope.cart.items = [];
          $scope.cart.save();
          $scope.$emit('cart:message', 'cart cleared');
        }
      }
    };
  })


  .directive('cartSummary', function(){
    
    return {
      restrict:'EA',
      scope:{
        cart:'='
      },
      template: require("./templates/cartsummary"),
      replace: true,
      link:function($scope, elem, $attr){
        $scope.checkqty = function(item){
          if(item.qty<1){
            item.qty = 1;
          }
        }
      }
    };
  })

  .directive('checkoutSummary', function(){
    
    return {
      restrict:'EA',
      scope:{
        cart:'='
      },
      template: require("./templates/checkoutsummary"),
      replace: true
    };
  })

  .directive('costSummary', function(){
    
    return {
      restrict:'EA',
      scope:{
        cart:'='
      },
      template: require("./templates/costsummary"),
      replace: true
    };
  })



  .directive('addressForm', function($countries){
    
    return {
      restrict:'EA',
      scope:{
        address:'='
      },
      template: require("./templates/addressform"),
      replace: true,
      link:function($scope){
        $scope.countries = $countries;

        $scope.country = null;

        $scope.$watch('address.country', function(c){
          if(!c){
            return;
          }
          if(!$scope.country || $scope.country.name!=c.name){
            $scope.country = $countries.filter(function(c){
              if(!$scope.address){
                return false;
              }
              return c.name==$scope.address.country;
            })[0]
          }
        }, true)
        $scope.$watch('country', function(c){
          if(!c){
            return;
          }
          $scope.$emit('address:country', c);
          $scope.address.country = c.name;
        }, true);
      }
    };
  })

  .directive('completePurchase', function(){
    
    return {
      restrict:'EA',
      template: require("./templates/completepurchase"),
      replace: true
    };
  })



/*

  .controller('CartCheckoutCtrl', function($scope, $shopdata, $randomid, $window, $http){
    
    $scope.dopurchase = function(){
      
      var errors = 0;
      $scope.haserror = false;

      if(!$scope.carddetails){
        return;
      }

      ['name', 'address_line1', 'address_line2', 'address_city', 'address_state', 'address_zip', 'address_country'].forEach(function(field){

        var val = $scope.carddetails.card[field];
        var elem = $('#address_' + field);
        var group = elem.closest('.form-group');
        if(!val){
          errors++;
          group.addClass('has-error');
        }
        else{
          group.removeClass('has-error');
        }
      })

      if(errors>0){
        $scope.haserror = true;
        return;
      }

      $scope.submitted = true;
      $scope.inprogress = true;

      $http({
        method: 'POST',
        url: '/stripe_checkout',
        data:$scope.cart_data()
      })
      .success(function(data, status, headers, config) {
        $scope.inprogress = false;
        $window.document.location = '/checkout.html';
      })
      .error(function(data, status, headers, config) {
        $scope.submitted = false;
        $scope.inprogress = false;
        $scope.ordererror = data;
      })

    }

    $scope.dopaypal = function(){
      $http({
        method: 'POST',
        url: '/paypal_stash',
        data:$scope.cart_data()
      })
      .success(function(data, status, headers, config) {
        
        $scope.cartid = data.id;

        setTimeout(function(){
          $('#paypal_form').submit();
        }, 500)
        
      })
      .error(function(data, status, headers, config) {
        console.log('-------------------------------------------');
        console.log('paypal error');
        console.dir(data);
      })
    }

    
  })

  */
});
require.register("binocarlos-ng-cornershop/templates/cartdropdown.js", function(exports, require, module){
module.exports = '<li class="shopping-cart dropdown" ng-cloak>\n    <a href="#" title="View your shopping cart"><i class="fa fa-shopping-cart"></i><span class="amount">{{ cart.getTotal(true) | currency:"£" }}</span></a>\n\n    <ul class="sub-menu">     \n        <li>                                      \n            <div class="dropdown-cart">\n                <span class="cart-items">You have <strong>{{ cart.items.length }}</strong> items in your cart</span>\n                <table class="table table-cart">\n                    <tbody>\n                        <tr>\n                            <th colspan="2">Product</th>\n                            <th class="text-center">Qty</th>\n                            <th>Total</th>\n                        </tr>\n                    \n                        <tr ng-repeat="item in cart.items">\n                            <td><img ng-src="{{ item.image }}" class="img-center" alt=""></td>\n                            <td><a href="">{{ item.name }}</a></td>\n                            <td class="text-center">{{ item.qty }}</td>\n                            <td>{{ item.price * item.qty | currency:"£" }}</td>\n                        </tr>\n                    </tbody>\n                </table>\n                <div class="row">\n                    <div class="col-md-6">\n                        <a href="" ng-click="$emit(\'cart:view\')" class="btn btn-xs btn-three">Edit cart</a>\n                        <a href="" ng-click="$emit(\'cart:reset\')" class="btn btn-xs btn-three">Clear cart</a>\n                    </div>\n                    <div class="col-md-6">\n                        <a href="" ng-click="$emit(\'cart:checkout\')" class="btn btn-xs btn-two pull-right">Proceed to checkout</a>\n                        <span class="clearfix"></span>\n                    </div>\n                </div>\n            </div>\n        </li>                                                                                                    \n    </ul>                                                                                                          \n</li>';
});
require.register("binocarlos-ng-cornershop/templates/stripebutton.js", function(exports, require, module){
module.exports = '<div>\n	<div ng-hide="stripedetails">\n		<a href="" ng-click="clickstripe()" class="btn btn-two">{{ title }}</a>\n	</div>\n	<div ng-show="stripedetails">\n\n		<table class="table-totals table-responsive">\n        <tbody>\n        	<tr>\n                <td><h5>card</h5></td>\n                <td><h4>{{ stripedetails.card.type }}</h4></td>\n            </tr>\n            <tr>\n                <td><h5>number</h5></td>\n                <td><h4>****-****-****-{{ stripedetails.card.last4 }}</h4></td>\n            </tr>\n            <tr>\n                <td><h5>expiry</h5></td>\n                <td><h4>{{ stripedetails.card.exp_month }} / {{ stripedetails.card.exp_year }}</h4></td>\n            </tr>\n            <tr>\n                <td><h5>email</h5></td>\n                <td><h4>{{ stripedetails.email }}</h4></td>\n            </tr>\n        </tbody>\n    </table>\n\n\n	</div>\n\n</div>';
});
require.register("binocarlos-ng-cornershop/templates/addressform.js", function(exports, require, module){
module.exports = '<form class="form" role="form">\n    <div class="form-group">\n        <label for="addressname">Your Name</label>\n        <input type="text" class="form-control" id="name" placeholder="Enter name" ng-model="address.name">\n    </div>\n    <div class="form-group">\n        <label for="addressline1">Address Line 1</label>\n        <input type="text" class="form-control" id="line1" placeholder="Enter address" ng-model="address.line1">\n    </div>\n    <div class="form-group">\n        <label for="addressline2">Address Line 2</label>\n        <input type="text" class="form-control" id="line2" placeholder="Enter address" ng-model="address.line2">\n    </div>\n    <div class="form-group">\n        <label for="addressline2">City</label>\n        <input type="text" class="form-control" id="city" placeholder="Enter city" ng-model="address.city">\n    </div>\n    <div class="form-group">\n        <label for="addressline2">Region</label>\n        <input type="text" class="form-control" id="state" placeholder="Enter region" ng-model="address.state">\n    </div>\n    <div class="form-group">\n        <label for="addresspostcode">Postcode</label>\n        <input type="text" class="form-control" id="zip" placeholder="Enter postcode" ng-model="address.zip">\n    </div>\n    <div class="form-group">\n        <label for="addresscountry">Country</label>\n        <select class="form-control" id="country" ng-model="country" ng-options="c.name for c in countries"></select>        \n    </div>\n    <div class="form-group">\n        <label for="addressname">Notes</label>\n        <textarea class="form-control" id="notes" ng-model="address.notes"></textarea>\n    </div>\n</form>';
});
require.register("binocarlos-ng-cornershop/templates/completepurchase.js", function(exports, require, module){
module.exports = '<div>\n\n	<button ng-click="dopurchase()" class="btn btn-primary">Make Purchase</button>\n\n	<div ng-show="haserror">\n	    <span class="label label-danger">Please enter all fields</span>\n	</div>\n	<div ng-show="inprogress">\n	    <span class="label label-primary">processing order...</span>\n	</div>\n	<div ng-show="ordererror">\n	    <span class="label label-danger">order error: {{ ordererror }}</span>\n	</div>\n</div>';
});
require.register("binocarlos-ng-cornershop/templates/costsummary.js", function(exports, require, module){
module.exports = '<div>\n	<h5><strong>Cost breakdown</strong></h5>\n	<hr>\n	<div class="col-sm-6"><strong>Subtotal:</strong></div>	\n	<div class="col-sm-6  "> {{ cart.getTotal() | currency:"£" }}</div>\n	<div class="col-sm-6"><strong>Shipping:</strong></div>	\n	<div class="col-sm-6 "> {{ cart.getExtraTotal() | currency:"£" }}</div>\n	<div class="col-sm-6"><strong>Total:</strong></div>	\n	<div class="col-sm-6 "> {{ cart.getTotal(true) | currency:"£" }}</div>\n</div>';
});
require.register("binocarlos-ng-cornershop/templates/cartsummary.js", function(exports, require, module){
module.exports = '<table class="table table-cart  table-responsive" ng-cloak>\n    <tbody>\n        <tr>\n            <th></th>\n            <th></th>\n            <th>Product name</th>\n            <th>Price</th>\n            <th>Quantity</th>\n            <th>Total</th>\n        </tr>\n    \n        <tr ng-repeat="item in cart.items">\n            <td class="remove-cell"><a href="" class="cart-remove" title="Remove item" ng-click="cart.removeItem(item.id);cart.save();"><i class="fa fa-times-circle fa-2x"></i></a></td>\n            <td><img ng-src="{{ item.image }}" class="img-center" alt=""></td>\n            <td><a href="">{{ item.name }}</a></td>\n            <td>{{ item.price | currency:"£" }}</td>\n            <td>\n                <input ng-change="checkqty(item);cart.save()" type="number" name="cant" ng-model="item.qty" style="width:60px; text-align:center; margin-right:5px; height:34px;">\n            </td>\n            <td>{{ item.price * item.qty | currency:"£" }}</td>\n        </tr>\n        <tr>\n            	<td colspan="4"></td>\n            	<td><strong>Total excluding shipping</strong></td>\n    						<td align=""><strong>{{ cart.getTotal() | currency:"£" }}</strong></td>\n\n        </tr>\n    </tbody>\n</table>';
});
require.register("binocarlos-ng-cornershop/templates/paypal_button.js", function(exports, require, module){
module.exports = '<form id="paypal_form" name="paypal_form" action="" method="post" align="left">\n	<input type="hidden" name="amount" ng-value="cart.getTotal(true) | number:2">\n	<input type="hidden" name="cmd" value="_xclick">\n	<input type="hidden" name="business" ng-value="settings.paypal_business">\n	<input type="hidden" name="item_name" ng-value="$paypaldesc(cart)">\n	<input type="hidden" name="shipping" ng-value="cart.getExtraTotal() | number:2">\n	<input type="hidden" name="no_note" value="1">\n	<input type="hidden" name="return" ng-value="settings.paypal_complete_url" />\n	<input type="hidden" name="cancel_return" ng-value="settings.paypal_cancel_url" />\n	<input type="hidden" name="notify_URL" ng-value="settings.paypal_ipn" />\n	<input type="hidden" name="rm" value="1">\n	<input type="hidden" name="custom" ng-value="stashid">\n	<input type="hidden" name="currency_code" value="GBP">\n	<input type="hidden" name="first_name" ng-value="address.name">\n	<input type="hidden" name="address1" ng-value="address.line1">\n	<input type="hidden" name="address2" ng-value="address.line2">\n	<input type="hidden" name="city" ng-value="address.city">\n	<input type="hidden" name="state" ng-value="address.region">\n	<input type="hidden" name="zip" ng-value="address.postcode">\n	<a href="#" ng-click="dopaypal()" class="btn btn-two">{{ title }}</a>\n</form>';
});
require.register("binocarlos-ng-cornershop/templates/checkout.js", function(exports, require, module){
module.exports = '<div class="container">\n    <div class="row">\n\n        <div class="col-md-12 acc-wizard">\n\n        	<div class="col-xs-3" style="background-color:#fff; border:1px solid #EEE;" >\n\n        		<h4>Checkout</h4>\n        		<hr>\n        		<ol class="acc-wizard-sidebar">\n				  <li class="acc-wizard-todo"><a href="#order">Order</a></li>\n				  <li class="acc-wizard-todo"><a href="#address">Address</a></li>\n                  <li class="acc-wizard-todo"><a href="#shipping">Shipping</a></li>\n				  <li class="acc-wizard-todo"><a href="#payment">Payment</a></li>\n				  \n				</ol>\n			\n				<div>\n            	   <checkout-summary cart="cart" />\n                </div>\n\n\n			</div>\n        	<div class="panel-group col-xs-9 " id="cartAccordian">\n                <div class="panel panel-default" style="background-color:#f5f5f5;padding:5px;">\n                    <a data-toggle="collapse" data-parent="#cartAccordian" href="#order">\n                    <div class="panel-heading" style="margin-bottom:5px;">\n                        <h4 class="panel-title">\n                            \n                            1. Order\n                            \n                        </h4>\n                    </div>\n                    </a>\n                    <div id="order" class="panel-collapse collapse in">\n                        <div class="panel-body" style="background-color:#fff;">\n\n                                <div>\n                                    <cart-summary cart="cart" />\n                                </div>\n\n<!--\n                                <div style="margin-top:30px;">\n                                    <a href="#address" class="nav next btn btn-success btn-xs pull-right" style="color:#fff;">Next &raquo;</a>\n                                </div>\n-->\n\n                        </div>\n                    </div>\n                </div>\n\n        \n\n                <div class="panel panel-default" style="background-color:#f5f5f5;padding:5px;">\n                    <a data-toggle="collapse" data-parent="#cartAccordian" href="#address">\n                    <div class="panel-heading" style="margin-bottom:5px;">\n                        <h4 class="panel-title">\n                            \n                            2. Address\n                            \n                        </h4>\n                    </div>\n                    </a>\n                    <div id="address" class="panel-collapse collapse ">\n                        <div class="panel-body" style="background-color:#fff;">\n\n                            <div>\n                              <address-form address="address" />\n                            </div>\n<!--\n                            <div style="margin-top:30px;">\n                                <a href="#order" class="nav back btn btn-xs btn-success pull-left" style="color:#fff;">&laquo; Back</a>\n                                <a href="#shipping" class="nav next btn btn-xs btn-success pull-right" style="color:#fff;">Next &raquo;</a>\n                            </div>\n-->\n                        </div>\n                    </div>\n                </div>\n                \n\n                <div class="panel panel-default" style="background-color:#f5f5f5;padding:5px;">\n                    <a data-toggle="collapse" data-parent="#cartAccordian" href="#shipping">\n                    <div class="panel-heading" style="margin-bottom:5px;">\n                        <h4 class="panel-title">\n                            \n                            3. Shipping\n                            \n                        </h4>\n                    </div>\n                    </a>\n                    <div id="shipping" class="panel-collapse collapse">\n                        <div class="panel-body" style="background-color:#fff;">\n\n                            <div>{{ labels.shipping_notes }}</div>\n                                    \n                            <div>\n                                <shipping-options shipping="shipping" cart="cart" />\n                            </div>\n\n                            <div>\n                                {{ cart.qty() }} item{{ (cart.qty()>1?\'s\':\'\') }} = {{ cart.getExtraTotal() | currency:"£" }}\n                            </div>\n\n<!--\n                            <div style="margin-top:30px;">\n                                <a href="#address" class="nav back btn btn-xs btn-success pull-left" style="color:#fff;">&laquo; Back</a>\n                                <a href="#payment" class="nav next btn btn-xs btn-success pull-right" style="color:#fff;">Next &raquo;</a>\n                            </div>\n\n-->\n                        </div>\n                    </div>\n                </div>\n                \n\n                <div class="panel panel-default" style="background-color:#f5f5f5;padding:5px;">\n                    <a id="paymentlink" data-toggle="collapse" data-parent="#cartAccordian" href="#payment">\n                    <div class="panel-heading" style="margin-bottom:5px;">\n                        <h4 class="panel-title">\n                            \n                            4. Payment\n                            \n                        </h4>\n                    </div>\n                    </a>\n                    <div id="payment" class="panel-collapse collapse">\n                        <div class="panel-body" style="background-color:#fff;">\n 							\n                            <div ng-hide="stripedetails">\n                                <paypal-button title="Pay With PayPal" settings="settings" cart="cart" address="address" />\n                            </div>\n\n                            <div style="margin-top:10px;">\n                                <stripe-button title="Pay With Card" settings="settings" cart="cart" address="address" />\n                            </div>\n\n                            <div ng-show="stripedetails" style="margin-top:10px;">\n\n                                <hr />\n\n                                <button ng-hide="inprogress" ng-click="stripepurchase()" class="btn btn-primary">Make Purchase</button>\n\n                                <div ng-show="error">\n                                    <span class="label label-danger">{{ error }}</span>\n                                </div>\n                                <div ng-show="inprogress">\n                                    <span class="label label-info">processing order...</span>\n                                </div>\n\n                            </div>\n<!--\n                            <div style="margin-top:30px;">\n                                <a href="#shipping" class="nav back btn btn-xs btn-success pull-left" style="color:#fff;">&laquo; Back</a>\n                            </div>\n-->\n                        </div>\n                    </div>\n                </div>\n\n            </div>\n\n            \n        </div>\n\n    </div>\n</div>';
});
require.register("binocarlos-ng-cornershop/templates/checkoutsummary.js", function(exports, require, module){
module.exports = '<div>\n	<div ng-if="cart.items.length>0">		\n		<hr>\n\n		<h4><i class="fa fa-shopping-cart"></i> Shopping bag	</h4>\n		<hr>\n\n		<div>\n			<img ng-src="{{ cart.items[0].image }}" class="img-responsive img-center" alt="" />\n			<p align="center">{{ cart.items[0].name }}</p>\n			<p align="center">{{ cart.items[0].price }}</p>\n		</div>\n		<hr>\n	</div>\n\n	<div ng-if="cart.items.length>1">\n		<div ng-click="shoppingExtra=!shoppingExtra" >\n			+ {{cart.items.length-1}} More. Show All\n			<hr>\n				\n		</div>\n	  <div ng-show="shoppingExtra">\n			<div ng-repeat="item in cart.items.slice(1)">\n								<img ng-src="{{ item.image }}" class="img-responsive img-center" alt="">\n							<p align="center">{{ item.name }}</p>\n								<p align="center"><strong>{{ item.price }}</strong></p>\n		    \n		   </div>	\n	  </div>	\n	</div>\n\n	<div>\n\n	    <cost-summary cart="cart" />\n\n	</div>\n</div>';
});
require.register("binocarlos-ng-cornershop/templates/shippingoptions.js", function(exports, require, module){
module.exports = '<div ng-repeat="shipping in shipping_destinations">\n    <div class="checkbox">\n        <label>\n          <input name="shipping" ng-model="choosencost" ng-value="shipping.price" ng-click="setshipping(shipping)" type="radio"> {{ shipping.name }} - &pound;{{ shipping.price }}\n        </label>\n    </div>\n</div>';
});
require.register("binocarlos-ng-units/index.js", function(exports, require, module){
var modulename = module.exports = 'ng-units';

angular
  .module(modulename, [])

  .filter('cm2inch', function(){
    return function(cms){
      return parseFloat(cms) / 2.54
    }
  })

  .filter('inch2cm', function(){
    return function(inches){
      parseFloat(inches) * 2.54;
    }
  })

});
require.register("funkybods-cart/index.js", function(exports, require, module){
var modulename = module.exports = 'funkybods-shop';

angular
  .module(modulename, [
  	require("binocarlos-ng-cornershop"),
    require("binocarlos-ng-units")
  ])

  // the data baked into the page from the server
  .factory('$data', function(){
    return window._data || {};
  })

  // the shop part of the data above
  .factory('$shopdata', function($data){
    return $data ? $data.shop_data : {}
  })

  .factory('$checkoutdata', function($data){
    return $data ? {
      shop_name:'FunkyBod Shop',
      ssl_dir:$data.ssl_dir,
      paypal_business:$data.paypal_business,
      paypal_ipn:$data.paypal_ipn,
      paypal_link:$data.paypal_link,
      stripe_publish_key:$data.stripe_publish_key,
      stripe_checkout_url:'/stripe_checkout',
      paypal_stash_url:'/paypal_stash',
      paypal_complete_url:'https://' + window.location.host + '/paypal_complete',
      paypal_cancel_url:'https://' + window.location.host + '/paypal_cancelled'
    } : {}
  })

  .factory('$growl', function(){
    return function(message, type){
      type = type || 'info';
      //window.scrollTo(0,0);

      var appendto = $('.add-growl');

      var elemselector = appendto.length>0 ? appendto : 'body';
      $.bootstrapGrowl(message, {
        ele: elemselector, // which element to append to
        type: type, // (null, 'info', 'error', 'success')
        offset: {from: 'top', amount: 20}, // 'top', or 'bottom'
        align: 'right', // ('left', 'right', or 'center')
        width: 250, // (integer, or 'auto')
        delay: 4000,
        allow_dismiss: true,
        stackup_spacing: 10 // spacing between consecutively stacked growls.
      });
    }
  })

  // inject the cart into every $scope
  .run(function($rootScope, $cornershop){

          
  })

  // the top level controller run on every page
  .controller('AppCtrl', function($scope, $shopdata, $cornershop){

    var shipping = $shopdata.shipping_destinations;
    var default_shipping = null;

    shipping.forEach(function(location){
      if(location.default){
        default_shipping = location;
      }
    })

    function get_country_shipping(country){
      var hit = null;
      shipping.forEach(function(location){
        if(location.country==country.name || location.region==country.region){
          if(!hit){
            hit = location;  
          }
        }
      })
      return hit || default_shipping;
    }


    function update_shipping(baseshipping){
      $scope.cart.setting('baseshipping', baseshipping);
      calculate_shipping();
    }

    function calculate_shipping(){

      var baseshipping = $scope.cart.setting('baseshipping');
      if(!baseshipping){
        return;
      }
      
      var items = $scope.cart.qty();
      var cost = items>1 ? baseshipping.price + (baseshipping.price * (items-1) * .4) : baseshipping.price;
      cost = Math.round(cost*100)/100;

      var shipping = {
        name:baseshipping.name,
        price:cost
      }
      
      $scope.cart.setExtra('shipping', shipping);
      $scope.cart.save();
    }

    $scope.cart = $cornershop('funkybods', true);

    $scope.$on('cart:add', function($ev, item){
      $scope.cart.addItem(item);
      $scope.cart.save();
    })

    $scope.$on('cart:view', function(){
      document.location = '/cart.html';
    })

    $scope.$on('cart:checkout', function(){
      document.location = '/cart.html';
    })

    $scope.$on('cart:complete', function(){
      $scope.cart.reset();
      $scope.cart.save();
      document.location = '/index.html';
    })

    $scope.$on('cart:reset', function(){
      $scope.cart.reset();
      $scope.cart.save();
    })

    $scope.$watch('cart.items', function($ev, items){
      calculate_shipping();
    }, true)

    $scope.$on('cart:shipping', function($ev, shipping){
      update_shipping(shipping);
      $scope.cart.save();
    })

    $scope.$on('address:country', function($ev, country){
      var shipping = get_country_shipping(country);
      $scope.$broadcast('shipping:force', shipping);
    })

  })

  // inject data into generic page
  .controller('DataCtrl', function($scope, $shopdata, $checkoutdata){

    $scope.colors = $shopdata.colors;
    $scope.sizes = $shopdata.sizes;

  })

  // the checkout controller
  .controller('CheckoutCtrl', function($scope, $shopdata, $checkoutdata){

    $scope.colors = $shopdata.colors;
    $scope.sizes = $shopdata.sizes;
    $scope.shipping = $shopdata.shipping_destinations;
    $scope.checkoutdata = $checkoutdata;
    $scope.labels = {
      shipping_notes:'multiple items are charged @ 40% of the base cost'
    }


  })


  .directive('shop', function($growl){
    
    return {
      restrict:'EA',
      template: require("./templates/shop"),
      replace: true,
      scope:{

      },
      controller:function($scope, $randomid, $shopdata){

        $scope.colors = $shopdata.colors;
        $scope.sizes = $shopdata.sizes;

        $scope.$watch('qty', function(val){
          var n = parseInt(val);

          if(isNaN(n)){
            $scope.qty = 1;
          }
        })

        $scope.mainimage = function(){
          var ret = $scope.maincolor.image || '';

          return $scope.sleeveless ? ret.replace(/\.png/, '_sleeveless.png') : ret;
        }

        $scope.addtocart = function(){
          var new_item = {
            id:$randomid(),
            name:$scope.maincolor.name + ($scope.sleeveless ? ' sleeveless' : '') + ' - ' + $scope.mainsize.name,
            price:29.99,
            qty:parseInt($scope.qty),
            image:$scope.mainimage(),
            desc:$scope.maincolor.name + ' - ' + $scope.mainsize.code + ($scope.sleeveless ? ' - sleeveless' : '')
          }

          new_item['$$hashKey'] = new_item.id;

          $scope.$emit('cart:add', new_item);
          $scope.resetproduct();
          $growl(new_item.name + ' x ' + new_item.qty + ' added to cart');

        }

        $scope.getcolor = function(name){
          var cols = $scope.colors.filter(function(c){
            return c.name==name;
          })
          return cols.length>0 ? cols[0] : null;
        }

        $scope.togglesleeveless = function(){
          $scope.sleeveless = !$scope.sleeveless;
          if($scope.sleeveless){
            $scope.choosecolor($scope.getcolor('Grey'));  
          }
        }

        $scope.resetproduct = function(){
          $scope.sleeveless = false;
          $scope.choosecolor($scope.colors[0]);
          $scope.choosesize($scope.sizes[0]);
          $scope.qty = 1;
        }

        $scope.choosecolor = function(color){
          $scope.colors.forEach(function(c){
            c.selected = false;
          })
          color.selected = true;
          $scope.maincolor = color;

          if(color.name!='Grey'){
            $scope.sleeveless = false;
          }
        }

        $scope.choosesize = function(size){
          $scope.sizes.forEach(function(s){
            s.selected = false;
          })
          size.selected = true;
          $scope.mainsize = size;
        }

        $scope.checkqty = function(){

          if($scope.qty<1){
            $scope.qty = 1;
          }
        }

        $scope.resetproduct();
      }
    }
  })


  .directive('colorTable', function(){
    
    return {
      restrict:'EA',
      scope:true,
      template: require("./templates/colortable"),
      replace: true,
      link:function($scope, elem, $attrs){
        $scope.isselected = function(color){
          if(!$attrs.silent){
            return color.selected
          }else{
            return false;
          }
        }
        $scope.choosetablecolor = function(color){
          if(!$attrs.silent){
            $scope.choosecolor(color);
          }
        }
      }
    }
  })

  .directive('sizeTable', function(){
    
    return {
      restrict:'EA',
      scope:true,
      template: require("./templates/sizetable"),
      replace: true,
      link:function($scope, elem, $attrs){
        $scope.isselected = function(size){
          if(!$attrs.silent){
            return size.selected
          }else{
            return false;
          }
        }
        $scope.choosetablesize = function(size){
          if(!$attrs.silent){
            $scope.choosesize(size);
          }
        }
      }
    };
  })



/*

  .controller('CartCtrl2', function($scope, $shopdata, $randomid, $window, $http, $growl){

    //localStorage["funkybods_cornershop"] = '';
    
    var cart = Shop('funkybods', true);

    $scope.cart = cart;

    $scope.haserror = false;
    $scope.submitted = false;
    $scope.ordererror = null;
    $scope.inprogress = false;
    
    $scope.shipping_destinations = $shopdata.shipping_destinations;
    $scope.shipping = $scope.cart.setting('shipping') || $scope.shipping_destinations[0];
    $scope.shippingmodel = $scope.shipping ? $scope.shipping.cost : null;
    $scope.hascard = false;
    $scope.carddetails = null;

    $scope.clearcart = function(){
      $scope.cart.items = [];
      $scope.cart.save();
      $scope.growl('cart cleared');
    }

    $scope.cartcomplete = function(){
      $scope.cart.items = [];
      $scope.cart.settings = {};
      $scope.cart.save();
      document.location = '/index.html';
    }

    $scope.setshipping = function(shipping){
      $scope.shipping = shipping;

    }

    $scope.shippingTotal = function(){
      return $scope.shipping.cost;
    }

    $scope.getTotal = function(){
      return Math.round(($scope.cart.getTotal() + $scope.shippingTotal())*100)/100;
    }

    

    $scope.$on('card', function($ev, token){

      var olddetails = $scope.carddetails ? $scope.carddetails.card : {};

      $scope.carddetails = token;

      Object.keys(olddetails || {}).forEach(function(f){
        if(!$scope.carddetails.card[f]){
          $scope.carddetails.card[f] = olddetails[f];
        }
      })

      $scope.stripedetails = true;
      $scope.hascard = true;
      $scope.devstring = JSON.stringify(token, null, 4);
    })

    $scope.paypal_url = function(path){
      return 'http://' + window.location.host + path;
    }

    $scope.paypal_business = function(){
      return window._paypal_email;
    }

    $scope.paypal_ipn = function(){
      return window._paypal_ipn;
    }

    $scope.cart_data = function(){
      return {
        card:$scope.carddetails,
        cart:{
          items:$scope.cart.items,
          settings:$scope.cart.settings,
          desc:$scope.cart_description(),
          notes:$scope.cart_full_description(),
          total:$scope.getTotal()
        }
      }
    }

  })

*/
});
require.register("funkybods-cart/templates/shop.js", function(exports, require, module){
module.exports = '<div class="w-box panel">\n	<div class="panel-body add-growl">\n    <div class="row">\n\n        <div class="col-sm-5">\n            <h3 class="section-title">Select your size.</h3>\n             \n        	<div>\n                <size-table />\n        	</div>\n        	<p>\n	            <strong>Please note</strong>\n	            <br>\n	            There is a size tolerance of +/- 2cm\n				If in doubt regarding the best size to suit, please follow the measurement chart as closely as possible\n\n	        </p>\n	        <p>\n	        		<strong>WASHING</strong> -The Garment should be washed at a maximum temperature of\n						40 degrees and should NOT be tumble dried.<br>\n\n					<strong>IRONING</strong> - You should NOT iron over the padded areas of the top.	\n	        </p>\n        </div>\n\n        <div class="col-sm-3">\n\n        	<div class="row">\n        		<div class="col-xs-12" style="padding-bottom:42px">\n            	    <h3 class="section-title">Select your color.</h3>\n		            <div>\n		            	<color-table />\n		            </div>\n				</div>		            \n			</div>	\n			<div class="row">\n        		<div class="col-xs-12">\n\n            \n		           <h3 class="section-title">Select your style.</h3>\n\n		            <div class="clickrow" ng-class="{selected:sleeveless}" ng-click="togglesleeveless();"> \n		                <div class="sleeve-swatch">\n		                    Sleveless<br />\n		                    <span class="smaller">\n		                        (only in grey)\n		                    </span><br />\n		                    <i class="fa" ng-class="{\'fa-square-o\':!sleeveless,\'fa-check-square-o\':sleeveless}"></i>\n		                </div>\n		            </div>\n\n	        	</div>\n	        </div>\n	    </div>    	\n\n        <div class="col-sm-4">\n\n        	<div class="">\n        				   <h3 class="section-title">Your Funkybod</h3>\n                            <div class="thumbnail">\n                                <img alt="" ng-src="{{ mainimage() }}" class="img-responsive">\n                                \n                                \n\n                            </div>\n                           \n                            <table>\n				                <tr>\n				                    <td><b>Color:</b></td>\n				                    <td>{{ maincolor.name }}</td>\n				                    \n				                </tr>\n				                <tr>\n				                	<td><b>Size:</b></td>\n				                    <td>{{ mainsize.name }}</td>\n				                </tr>\n				                <tr ng-show="sleeveless">\n				                    <td><b>Style:</b></td>\n				                    <td>Sleveless</td>\n				                </tr>\n				                <tr>\n				                    <td><b>Qty:</b></td>\n				                    <td><input type="number" class="input form-control" ng-model="qty" placeholder="1" /></td>\n				                </tr>\n				                <tr>\n				                    <td><b>Price:</b></td>\n				                    <td>{{ qty * 29.99 | currency:"£" }}</td>\n				                </tr>\n				                \n				            </table>\n				                 \n\n                        </div>\n\n\n            \n            \n            \n    <!--\n            <label>\n              <input type="radio" name="5dayshipping" id="5dayshipping" value="45" checked="">\n              5 Day shipping @ £45\n            </label>\n    -->\n          <br>\n\n            <button class="btn btn-two " ng-click="addtocart()"><i class="fa fa-plus-square"></i>Add To Cart</button>\n            <a class="btn btn-four" href="/cart.html"> Edit Cart</a>\n            <a class="btn btn-four" href="/cart.html"><i class="fa fa-shopping-cart"></i> Checkout</a>\n\n            <!--\n            <form action="/charge" method="POST">\n              <script\n                src="https://checkout.stripe.com/checkout.js" class="stripe-button"\n                data-key="pk_test_npUDT7hoMCMbr16LZBGEyhsM"\n                data-image="/square-image.png"\n                data-name="Demo Site"\n                data-description="2 widgets ($20.00)"\n                data-amount="2000">\n              </script>\n            </form>\n            -->\n        </div>\n            \n    </div>\n    </div>\n</div>';
});
require.register("funkybods-cart/templates/sizetable.js", function(exports, require, module){
module.exports = '<table class="sizetable table table-bordered table-responsive">\n<thead>\n  <tr class="wp-theme-3 bg-4">\n    <th>Size</th>\n    <th>Chest (cm)</th>\n    <th>Chest (in)</th>\n    <th>Length (cm)</th>\n  </tr>\n</thead>\n<tbody>\n<tr ng-repeat="size in sizes" style="cursor:hand;" ng-class="{selected:isselected(size)}" ng-click="choosetablesize(size);">\n  <td class="info"><strong>{{ size.name }}</strong></td>\n  <td>{{ size.chest[0] }} - {{ size.chest[1] }}</td>\n  <td>{{ size.chest[0] | cm2inch | number:1 }} - {{ size.chest[1] | cm2inch | number:1 }}</td>\n  <td>{{ size.length }}</td>\n</tr>\n</tbody>\n\n</table>';
});
require.register("funkybods-cart/templates/colortable.js", function(exports, require, module){
module.exports = '<table class="sizetable table table-bordered table-responsive">\n<thead>\n  <tr class="wp-theme-3 bg-1">\n    <th>Color</th>\n  </tr>\n</thead>\n<tbody>\n<tr ng-repeat="color in colors" style="cursor:hand;" ng-class="{selected:isselected(color)}" ng-click="choosetablecolor(color);">\n  <td class="info">\n    <strong>\n      <i class="fa" ng-class="{\'fa-square-o\':!color.selected,\'fa-check-square-o\':color.selected}"></i>\n      {{ color.name }}\n      <div class="color-swatch" ng-style="{\'background-color\':color.color}"></div>\n    </strong>\n  </td>\n</tr>\n</tbody>\n\n</table>';
});









