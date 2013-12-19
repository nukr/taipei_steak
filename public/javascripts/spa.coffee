app = angular.module('Report', [])

app.controller 'ReportListCtrl', ($scope, $http, $location, $filter) ->

  $scope.queryDate = new Date()
  $scope.queryDate = $filter('date')($scope.queryDate, 'yyyy/MM/dd')
  $('a[href="#bills"]').tab('show')
  $('#datepicker').datepicker
    dateFormat: 'yy/mm/dd'
  $scope.initQuery = ->
    $http
      method: 'GET'
      url: "/api/report/#{$scope.queryDate}/#{$('#shift').eq(0).val()}"
    .success (data, status, headers, config) ->
      $scope.reports = data

  $scope.initQuery()

  $scope.query = ->
    date = $('#datepicker').eq(0).val()
    $http
      method: 'GET'
      url: "/api/report/#{date}/#{$('#shift').eq(0).val()}"
    .success (data, status, headers, config) ->
      $scope.reports = data

  $scope.m2e = ->
    if $('#shift').eq(0).val() is 'morning'
      $http
        method: 'GET'
        url: "/m2e/#{this.c._id}"
      .success (data, status, headers, config) ->
        $scope.query()
    else
      $http
        method: 'GET'
        url: "/e2m/#{this.c._id}"
      .success (data, status, headers, config) ->
        $scope.query()

