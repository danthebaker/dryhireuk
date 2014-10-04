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
