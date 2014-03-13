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

  .controller('BaseCtrl', function($scope){
    console.log('-------------------------------------------');
    console.log('YO AM HERE');
  })

  .controller('DashboardCtrl', function($scope){
    console.log('-------------------------------------------');
    console.log('DashboardCtrl');
  })

  .controller('ProductsCtrl', function($scope){
    console.log('-------------------------------------------');
    console.log('ProductsCtrl');
  })

