timesheetApp.controller("ListCtrl", function ($scope, $location, $filter, dataService) {

  // first - validate if data is loaded to global scope
  if(!dataService.currentUser){
    $location.path(''); // no data - go to landing page
    return;
  }


  $scope.prepareVisibleData = function()
  {
    $scope.visibleData = [];

    for(var u = 0; u < dataService.usersList.length; u++ ){

      var tempDate = new Date(dataService.baseDate);
      var user = {userid: dataService.usersList[u].userid, name: dataService.usersList[u].name, display: true};
      user.data = [];

      tempDate.setDate(tempDate.getDate() - (tempDate.getDay() + 7)); // get previous week Monday

      for(var i = 0; i < 21; i++){
        tempDate.setDate(tempDate.getDate() + 1);

        if(tempDate.getDay() == 6 || tempDate.getDay() == 0 ) {
          continue; // exclude weekends
        }

        var dateStr = $filter('date')(tempDate, 'dd/MM/yyyy');
        user.data.push({date: tempDate.toJSON(), dateString: dateStr});

      }

      if(user.userid == dataService.currentUser.userid){
        $scope.visibleData.unshift(user); // add current uset at the top
      }else{
        $scope.visibleData.push(user);
      }
    }
  }


  $scope.jumpBaseDate = function(days){
    $scope.editMode = false;
    dataService.baseDate.setDate(dataService.baseDate.getDate() + days);
    $scope.prepareVisibleData();
    dataService.calculateClashes();
    $scope.bindClashesToModel();
  }



  // editing methods
  $scope.editEntry = function(event, day, user, unit){

    if(user.userid != dataService.currentUser.userid) return;

    // store editing data
    $scope.editX = event.clientX; // edit window coordinates
    $scope.editY = event.clientY;
    $scope.editUnit = unit;
    $scope.editDay = day;

    // run edit mode
    $scope.editMode = true;
  }

  $scope.saveEntry = function(value){

    if($scope.editDays && $scope.editDays > 0){ // few days
      var date = dataService.stringToDate($scope.editDay.dateString);
      for(var i = 0; i < $scope.editDays; i++){
        if(date.getDay() == 0 || date.getDay() == 6 ){
          date.setDate(date.getDate() + 1); // correction for weekends
          i--;
        }

        dataService.updateUnit(dataService.currentUser.userid, $filter('date')(date, 'dd/MM/yyyy'), 'AM', value);
        dataService.updateUnit(dataService.currentUser.userid, $filter('date')(date, 'dd/MM/yyyy'), 'PM', value);
        date.setDate(date.getDate() + 1);
      }
    }else{ // single unit
      dataService.updateUnit(dataService.currentUser.userid, $scope.editDay.dateString, $scope.editUnit, value);
    }

    $scope.editDay.updated = new Date; // change model to rebind
    $scope.editMode = false;
    $scope.editDays = null;
    $scope.bindClashesToModel();
  }

  $scope.bindClashesToModel = function(){

    for(var day in $scope.visibleData[0].data){
      var mainDay = $scope.visibleData[0].data[day];
      var clashes = dataService.getClashesByDate(mainDay.dateString);
      if(clashes){
        mainDay.isInClash = true;
      }else{
        mainDay.isInClash = false;
      }

      }
    }

  $scope.showClashes = function(day){
    // find clashes for this day
    var clashes = dataService.getClashesByDate(day.dateString);

    if(!clashes) return;


    day.clashClass = 'clash';
    $scope.visibleData[0].display = false; // always display current user
    $scope.showClashMode = true; // switch to show clash mode

    for (var c = 0; c < clashes.length; c++) {
      var clash = clashes[c];

      // get clashed day model
      var clashRow = $scope.visibleData.filter(function(data){return (data.userid == clash.userid)})[0];
      clashRow.display = false;
      var clashDay = clashRow.data.filter(function(data){return (data.dateString == clash.date)})[0];
      if(clashDay)
        clashDay.clashClass = 'clash';

    }
  };

  $scope.hideClashes = function(){
    $scope.showClashMode = false;
    for(var i in $scope.visibleData) {
      $scope.visibleData[i].display = true;
      for(var day in $scope.visibleData[i].data){
        $scope.visibleData[i].data[day].clashClass = "";
      }
    };
  };

  $scope.prepareVisibleData();
  dataService.calculateClashes();
  $scope.bindClashesToModel();

});
