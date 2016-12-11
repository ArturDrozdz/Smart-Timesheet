timesheetApp.controller("LandingCtrl", function ($scope, $rootScope, $http, $location, dataService) {

  // empty model
  $scope.usersList = [];

  // load json and store it to data service
  $http.get('data/data.json').success (function(data){

    dataService.loadData(data);
    $scope.usersList = dataService.usersList;

  });

  // load bank holidays
  $http.get('data/public_holidays.json').success (function(data){
    dataService.bankHolidays = data;
  });


  $scope.openList = function () {
    dataService.currentUser =  $scope.currUser;
    $rootScope.currentUser = $scope.currUser;
    $location.path('/list/' + $scope.currUser.userid);
  }

});
