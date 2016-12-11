
timesheetApp.service("dataService", ['$filter', function($filter) {

  this.hashData = new Object();
  this.usersList = [];
  this.currentUser;
  this.clashes = new Object();
  this.bankHolidays = [];
  this.baseDate = new Date();

  this.loadData = function(data) {
      // store data to hashtable - for better performance
      for (var i = 0; i < data.length; i++) {
        var hashKey = data[i].date + "|" + data[i].userid;
        if(!this.hashData.hasOwnProperty(hashKey)){
          this.hashData[hashKey] = data[i];
          this.hashData[hashKey].units = new Object();
        }
        this.hashData[hashKey].units[data[i].unit] = data[i].value;
      }

      // distinct and sort users for later usage
      this.usersList = $filter('unique')(data, 'name', false);
      this.usersList = $filter('orderBy')(this.usersList, 'name', false);

      // add public holidays
      for (var user in this.usersList) {
        for (var holiday in this.bankHolidays) {

          var hashKey = this.bankHolidays[holiday].date + "|" + this.usersList[user].userid;

          if(!this.hashData.hasOwnProperty(hashKey)){
            this.hashData[hashKey] = {userid : this.usersList[user].userid, date: this.bankHolidays[holiday].date};
            this.hashData[hashKey].units = new Object();
            this.hashData[hashKey].units['AM'] = 'P';
            this.hashData[hashKey].units['PM'] = 'P';
          }
        }
      }


      console.log('Data successfully loaded.');
  };

  this.getUnit = function(date, userID, unit){

    var hashKey = date + "|" + userID;
    if(this.hashData.hasOwnProperty(hashKey))
    {
      if(this.hashData[hashKey].units.hasOwnProperty(unit))
        return this.hashData[hashKey].units[unit];
    }

    return null;
  };



  this.getRecord = function(date, userID){
    var hashKey = date + "|" + userID;

    if(this.hashData.hasOwnProperty(hashKey))
      return this.hashData[hashKey];

    return null;
  };



  this.updateUnit = function(userID, date, unit, value){
    var hashKey = date + "|" + userID;

    if(value == '' ){ // clear unit
      if(this.hashData.hasOwnProperty(hashKey)){ // clear absense
        delete this.hashData[hashKey].units[unit];

        if(Object.keys(this.hashData[hashKey].units).length == 0){
          delete this.hashData[hashKey];
        }
      }
    }else{
      if(!this.hashData.hasOwnProperty(hashKey)) // if no user entry - create new record
      {
          this.hashData[hashKey] = ({
            "userid": userID,
            "date": date,
          });
          this.hashData[hashKey].units = new Object();
      }
      this.hashData[hashKey].units[unit] = value;
    }

    this.calculateClashes();
    console.log('EXAMPLE SERVER UPDATE REQUEST');
  };




  this.calculateClashes = function(){
    this.clashes = [];
    for (var key in this.hashData) {

      var currRecord = this.hashData[key];
      if(currRecord.userid == this.currentUser.userid) continue;

      var date = this.stringToDate(currRecord.date);
      if(date.getDay() == 0 || date.getDay() == 6 ) continue; // ignore weekends

      if(date.getDay() > 0 && date.getDay() < 5){ // correction for weekends
        date.setDate(date.getDate() - 6);
      } else {
        date.setDate(date.getDate() - 4);
      }

      for(var i = 0; i < 9; i++){ // range winith 4 days

        if(date.getDay() == 0 || date.getDay() == 6 ){
          date.setDate(date.getDate() + 1); // correction for weekends
          i--;
        }else{
          var clash = this.getRecord($filter('date')(date, 'dd/MM/yyyy'), this.currentUser.userid);
          if(clash)
            this.addClash(clash.date, currRecord);

          date.setDate(date.getDate() + 1);
        }
      }

    }
  };


  this.getClashesByDate = function(date){
    return this.clashes[date];
  };

  this.addClash = function(date, record){
    if(!this.clashes.hasOwnProperty(date)){
      this.clashes[date] = [];
    }
    this.clashes[date].push(record);
  };

  this.stringToDate = function(dateString){
    var dateSplit = dateString.split("/");
    return new Date(dateSplit[2], dateSplit[1] - 1, dateSplit[0]);
  };

}]);
