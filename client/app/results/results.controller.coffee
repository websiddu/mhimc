'use strict'

angular.module 'mhimcApp'
.controller 'ResultsCtrl', ($scope, crimeData) ->

  $scope.resultsview = false
  $scope.currentAddress = localStorage['current_loaction']
  $scope.loading = false

  $scope.enableResultsView = ->
    $scope.resultsview = true

  $scope.init = ->
    _loadLocationCrimeDetails()

  _loadLocationCrimeDetails = ->
    $scope.loading = true
    crimeData.inRadius(47.6091695, -122.3355949, 2000)
      .success (data, status) ->
        $scope.loading = false
        console.log data
        data = MG.convert.date(data, 'date_reported');
        MG.data_graphic
          title: "UFO Sightings",
          description: "Yearly UFO sightings from the year 1945 to 2010.",
          data: data,
          width: 650,
          height: 150,
          target: '#graph',
          x_accessor: 'date_reported',
          y_accessor: 'sightings',
          markers: [{'year': 1964, 'label': '"The Creeping Terror" released'}]



  $scope.init()
