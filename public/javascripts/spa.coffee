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

app.controller 'MonthlyStatementCtrl', ($scope, $http, $filter) ->

    $scope.queryDate = new Date()
    year = moment().format('YYYY')
    month = moment().format('MM')
    firstDayOfMonth = moment().startOf('month').format('DD')
    lastDayOfMonth = moment().endOf('month').format('DD')
    $scope.monthlyReports = []
    $scope.total = {
        allRawPrice: 0
        allServiceTip: 0
        allDiscountTip: 0
        allDonePrice: 0
    }
    $scope.queryDate = $filter('date')($scope.queryDate, 'yyyy/MM/dd')
    $('a[href="#monthly_revenue"]').tab('show')

    $('#monthly_datepicker').datepicker
        dateFormat: 'yy/mm/dd'

    $scope.initQuery = (day) ->
        $http
            method: 'GET'
            url: "/api/monthly_report/#{year}/#{month}/#{day}"
        .success (data, status, headers, config) ->
            $scope.monthlyReports[day] = data
            $scope.monthlyReports[day].date = "#{year}-#{month}-#{day}"
            $scope.total.allRawPrice += data.info.allRawPrice
            $scope.total.allServiceTip += data.info.allServiceTip
            $scope.total.allDiscountTip += data.info.allDiscountTip
            $scope.total.allDonePrice += data.info.allDonePrice

    day = 1
    ( ->
        $http
            method: 'GET'
            url: "/api/monthly_dishcount/#{year}/#{month}/#{day}"
        .success (data, status, headers, config) ->
            $scope.monthlyDishCount = data
    )()

    while day <= lastDayOfMonth
        $scope.initQuery(day)
        day += 1

    $scope.query = ->
        $scope.monthlyReports = []
        date = $('#monthly_datepicker').eq(0).val()
        date = moment(date, "YYYY-MM-DD")
        year = date.format('YYYY')
        month = date.format('MM')
        day = 1
        $scope.total = {
            allRawPrice: 0
            allServiceTip: 0
            allDiscountTip: 0
            allDonePrice: 0
        }
        ( ->
            $scope.monthlyDishCount = []
            $http
                method: 'GET'
                url: "/api/monthly_dishcount/#{year}/#{month}/#{day}"
            .success (data, status, headers, config) ->
                $scope.monthlyDishCount = data
        )()
        firstDayOfMonth = date.startOf('month').format('DD')
        lastDayOfMonth = date.endOf('month').format('DD')
        while day <= lastDayOfMonth
            ((day) ->
                $http
                    method: 'GET'
                    url: "/api/monthly_report/#{year}/#{month}/#{day}"
                .success (data, status, headers, config) ->
                    $scope.monthlyReports[day] = data
                    $scope.monthlyReports[day].date = "#{year}-#{month}-#{day}"
                    $scope.total.allRawPrice += data.info.allRawPrice
                    $scope.total.allServiceTip += data.info.allServiceTip
                    $scope.total.allDiscountTip += data.info.allDiscountTip
                    $scope.total.allDonePrice += data.info.allDonePrice
            )(day)
            day += 1
