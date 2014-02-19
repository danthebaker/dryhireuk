var modulename = module.exports = 'funkybods-shop';

angular
  .module(modulename, [
  	require('ng-cornershop'),
    require('ng-units')
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
      template: require('./templates/shop'),
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
      template: require('./templates/colortable'),
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
      template: require('./templates/sizetable'),
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