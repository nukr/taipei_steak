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

}).call(this);
