ng-toptrump
===========

Angular directive that renders a top-trump card for an objects data

## installation

```
$ component install binocarlos/ng-toptrump
```

## usage

```js
angular
  .module('MyApp', [
  	require('ng-toptrump')
  ])

  .controller('MyCtrl', function($scope){

  	// the fields to display for each object
  	$scope.toptrump_fields = [{

  		// the title for the field
  		title:'Horsepower',

  		// the name of the field to extract the value
  		value:'horsepower'
  	},{
	  	title:'Weight',
	  	value:'weight'
	  },{
	  	title:'Power/Weight Ratio',

	  	// the value can also be a function to extract the value dynamically
	  	value:function(obj){
	  		// return p/w ratio to 2 decimal places
	  		return Math.round((obj.horsepower / obj.weight) * 100) / 100;
	  	}
	  }]

  	// the data to display
  	$scope.cars = [{
  		name:'Golf GTI',
  		image:'img/golf.jpg',
  		horsepower:240,
  		weight:780,
  		cylinders:4
  	},{
  		name:'Veyron',
  		image:'img/veyron.jpg',
  		horsepower:1001,
  		weight:1800,
  		cylinders:16
  	}]
  	
	})
```

```html
<div>

	<div ng-repeat="car in cars">
		<toptrump data="car" fields="toptrump_fields">
      <h3>{{ car.name }}</h3>
      <div><img ng-src="{{ car.image }}" /></div>
    </toptrump>
	</div>

</div>
```

## toptrump directive

this directive takes the following scope:

 * data:'=' - the object to render in the card
 * fields:'=' - the array of fields to display

the content in the directive is transcluded onto the top-trump card

## license

MIT