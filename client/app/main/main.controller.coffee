'use strict'

angular.module 'mhimcApp'
.controller 'MainCtrl', ($scope, $location, $timeout) ->
  $scope.awesomeThings = []

  # $http.get('/api/things/search/university').success (data) ->
  #   console.log data
  $scope.address = ""

  $scope.addressOptions =
    country: 'us'
    #types: '(cities)'

  $scope.loadResults = ->

    $timeout ->
      document.getElementById('address').blur()
      localStorage['current_loaction'] = $scope.address;
      $location.path("/results")
    , 100



