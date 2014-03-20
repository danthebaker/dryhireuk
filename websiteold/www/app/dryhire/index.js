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

  .controller('HireCtrl', function($scope, $shopdata, $location, $rootScope){
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