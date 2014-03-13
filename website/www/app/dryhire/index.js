var modulename = module.exports = 'dryhire';

angular
  .module(modulename, [
  	require('ng-toptrump'),
    require('ng-ravens'),
    require('ng-map'),
    require('ng-cornershop')
  ])

  // the data baked into the page from the server
  .factory('$data', function(){
    return window._data || {};
  })

  // the shop part of the data above
  .factory('$shopdata', function($data){
    return $data ? ($data.shopdata || {}) : {}
  })

  .factory('$settings', function($data){
    return $data ? ($data.settings || {}) : {}
  })

  .controller('BaseCtrl', function($scope, $cornershop, $shopdata, $settings, $location, $rootScope){
    $scope.shopdata = $shopdata;
    $scope.cart = $cornershop('dryhire', true);
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

  .controller('HireCtrl', function($scope, $shopdata, $settings, $location, $rootScope){
    
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

    $rootScope.$on('$locationChangeSuccess', function(event){
      if($location.path()=='/'){
        $scope.selected = null;
      }
      else{
        var id = $location.path().replace(/^\//, '');
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

  .controller('ContactCtrl', function($scope, $settings, $window){
    $scope.settings = $settings;
    $scope.map = $settings.business.map;

  })