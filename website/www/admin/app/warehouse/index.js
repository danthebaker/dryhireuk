var modulename = module.exports = 'dryhire.warehouse';

angular
  .module(modulename, [
    require('digger-admin'),
    'ngRoute'
  ])

  
  .config(function($routeProvider){

    $routeProvider

      .when('/', {
        templateUrl: "/admin/views/dashboard.html",
        controller:'DashboardCtrl'
      })

      .when('/products', {
        templateUrl: "/admin/views/products.html",
        controller:'ProductsCtrl'
      })


  })

  .controller('BaseCtrl', function($scope){
    $digger.blueprint.loadstatic([
      '/blueprints/shop.xml'
    ])
  })

  .controller('DashboardCtrl', function($scope){
    console.log('-------------------------------------------');
    console.log('DashboardCtrl');
  })

  .factory('$iconfn', function(){
    return function(container){
      if(!container){
        return 'fa-folder';
      }
      if(container.is('folder')){
        return 'fa-folder';
      }
      else if(container.is('_supplychain')){
        return 'fa-sitemap';
      }
      return 'fa-cog';
    }
  })

  .factory('$blueprintfn', function(){
    return function(container){
      return [
        'folder',
        'product'
      ]
    }
  })

  .controller('ProductsCtrl', function($scope, $iconfn, $blueprintfn){
    
    $scope.products = $digger.connect('/wholesaler/products');
    $scope.products.attr('title', 'Products');
    $scope.blueprint = $digger.blueprint.get('product');

    $scope.settings = {
      showchildren:false,
      showdigger:true,
      showjson:true,
      shownav:false,
      showbuttons:false,
      showadd:true,
      blueprintfn:$blueprintfn,
      iconfn:$iconfn
    } 

    $scope.$on('crud:tree:loaded', function(){

    })

/*
    
    $scope.settings = {
      folder_mode:true,
      add_mode:true,
      foldersaved:function(){
        console.log('-------------------------------------------');
        console.log('saved');
      },
      blueprint:'product',
      selector_path:$routeParams.producturl
      //parent_selector:get_selector(),
      //selector:get_selector(true)
    }
    */

  })

