'use strict'

angular.module 'mhimcApp'
.controller 'MainCtrl', ($scope, $location) ->
  $scope.awesomeThings = []

  # $http.get('/api/things/search/university').success (data) ->
  #   console.log data
  $scope.address = ""

  $scope.addressOptions =
    country: 'us'
    #types: '(cities)'

  $scope.loadResults = ->
    localStorage['select_loaction'] = $scope.address;
    $location.path("/results")



