(function() {
  var app;

  app = angular.module('Report', []);

  app.controller('ReportListCtrl', function($scope, $http, $location, $filter) {
    $scope.queryDate = new Date();
    $scope.queryDate = $filter('date')($scope.queryDate, 'yyyy/MM/dd');
    $('a[href="#bills"]').tab('show');
    $('#datepicker').datepicker({
      dateFormat: 'yy/mm/dd'
    });
    $scope.initQuery = function() {
      return $http({
        method: 'GET',
        url: "/api/report/" + $scope.queryDate + "/" + ($('#shift').eq(0).val())
      }).success(function(data, status, headers, config) {
        return $scope.reports = data;
      });
    };
    $scope.initQuery();
    $scope.query = function() {
      var date;
      date = $('#datepicker').eq(0).val();
      return $http({
        method: 'GET',
        url: "/api/report/" + date + "/" + ($('#shift').eq(0).val())
      }).success(function(data, status, headers, config) {
        return $scope.reports = data;
      });
    };
    return $scope.m2e = function() {
      if ($('#shift').eq(0).val() === 'morning') {
        return $http({
          method: 'GET',
          url: "/m2e/" + this.c._id
        }).success(function(data, status, headers, config) {
          return $scope.query();
        });
      } else {
        return $http({
          method: 'GET',
          url: "/e2m/" + this.c._id
        }).success(function(data, status, headers, config) {
          return $scope.query();
        });
      }
    };
  });

  app.controller('MonthlyStatementCtrl', function($scope, $http, $filter) {
    var day, firstDayOfMonth, lastDayOfMonth, month, year;
    $scope.queryDate = new Date();
    year = moment().format('YYYY');
    month = moment().format('MM');
    firstDayOfMonth = moment().startOf('month').format('DD');
    lastDayOfMonth = moment().endOf('month').format('DD');
    $scope.monthlyReports = [];
    $scope.queryDate = $filter('date')($scope.queryDate, 'yyyy/MM/dd');
    $('a[href="#monthly_revenue"]').tab('show');
    $('#monthly_datepicker').datepicker({
      dateFormat: 'yy/mm/dd'
    });
    $scope.initQuery = function(day) {
      return $http({
        method: 'GET',
        url: "/api/monthly_report/" + year + "/" + month + "/" + day
      }).success(function(data, status, headers, config) {
        $scope.monthlyReports[day] = data;
        return $scope.monthlyReports[day].date = "" + year + "-" + month + "-" + day;
      });
    };
    day = 1;
    (function() {
      return $http({
        method: 'GET',
        url: "/api/monthly_dishcount/" + year + "/" + month + "/" + day
      }).success(function(data, status, headers, config) {
        $scope.monthlyDishCount = data;
        return console.log(data);
      });
    })();
    while (day <= lastDayOfMonth) {
      $scope.initQuery(day);
      day += 1;
    }
    return $scope.query = function() {
      var date, _results;
      $scope.monthlyReports = [];
      date = $('#monthly_datepicker').eq(0).val();
      date = moment(date, "YYYY-MM-DD");
      year = date.format('YYYY');
      month = date.format('MM');
      day = 1;
      (function() {
        $scope.monthlyDishCount = [];
        return $http({
          method: 'GET',
          url: "/api/monthly_dishcount/" + year + "/" + month + "/" + day
        }).success(function(data, status, headers, config) {
          $scope.monthlyDishCount = data;
          return console.log(data);
        });
      })();
      firstDayOfMonth = date.startOf('month').format('DD');
      lastDayOfMonth = date.endOf('month').format('DD');
      _results = [];
      while (day <= lastDayOfMonth) {
        (function(day) {
          return $http({
            method: 'GET',
            url: "/api/monthly_report/" + year + "/" + month + "/" + day
          }).success(function(data, status, headers, config) {
            $scope.monthlyReports[day] = data;
            return $scope.monthlyReports[day].date = "" + year + "-" + month + "-" + day;
          });
        })(day);
        _results.push(day += 1);
      }
      return _results;
    };
  });

}).call(this);
