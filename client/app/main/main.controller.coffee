'use strict'

angular.module 'mhimcApp'
.controller 'MainCtrl', ($scope, $location, $timeout) ->
  $scope.awesomeThings = []

  # $http.get('/api/things/search/university').success (data) ->
  #   console.log data
  $scope.address = ""
  $scope.details = null
  $scope.addressOptions =
    country: 'us'
    state: 'wa'
    #types: '(cities)'

  $scope.loadResults = ->

    $timeout ->
      document.getElementById('address').blur()
      localStorage['lat'] = $scope.details.geometry.location.lat()
      localStorage['lng'] = $scope.details.geometry.location.lng()
      localStorage['current_loaction'] = $scope.address;
      $location.path("/results")
    , 100



