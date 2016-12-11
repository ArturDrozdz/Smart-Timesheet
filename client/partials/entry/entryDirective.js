timesheetApp.directive('calendarEntry', function($compile, dataService) {
  return {
    restrict: 'E',
    templateUrl: 'client/partials/entry/entry.html',
    scope:{
      day: '=day',   // pass day model
      user: '=user', // pass user model
      unit: '@unit'
    },
    controller: function($scope, $filter, dataService){

      $scope.entry = dataService.getUnit($scope.day.dateString, $scope.user.userid, $scope.unit);

      // watch for changes - better perfomance
      $scope.$watch('day', function(newValue, oldValue) {
          $scope.entry = dataService.getUnit($scope.day.dateString, $scope.user.userid, $scope.unit);
      }, true);

      // universal method for checking the day status
      $scope.entryStatus = function(value){
        if($scope.entry){
          return $scope.entry == value;
        }
        return false;
      }

      $scope.getTitle = function(){
        switch ($scope.entry) {
        case 'P':
          return 'Public Holiday';
          break;
        case 'V':
          return 'Vacation';
          break;
        case 'T':
          return 'Training';
          break;
        default:
          return 'Preset';
        }
      };

    }
  };
});
