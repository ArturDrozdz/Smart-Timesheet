var timesheetApp = angular.module('timesheetApp', ['ngRoute', 'ngAnimate']);

timesheetApp.config(['$routeProvider',
function ($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'client/partials/landing/landing.html',
    controller: 'LandingCtrl'
  }).
  when('/list/:userID', {
    templateUrl: 'client/partials/list/list.html',
    controller: 'ListCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
} ]);


timesheetApp.filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});
