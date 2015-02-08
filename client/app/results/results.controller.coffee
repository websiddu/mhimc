'use strict'

angular.module 'mhimcApp'
.controller 'ResultsCtrl', ($scope, crimeData) ->

  $scope.resultsview = false
  $scope.currentAddress = localStorage['current_loaction']
  $scope.loading = false
  circle = null
  _options =
    # maxBounds: bounds
    # zoomControl: false
  map = null
  tilesUrl = "https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png"
  attributions =
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-20v6611k'

  hIcon = L.Icon.extend(options:
    shadowUrl: '/assets/images/house-shadow.png'
    iconSize: [
      50
      82
    ]
    shadowSize: [
      50
      64
    ]
    iconAnchor: [
      22
      94
    ]
    shadowAnchor: [
      4
      62
    ]
    popupAnchor: [
      -3
      -76
    ])

  houseIcon = new hIcon(iconUrl: '/assets/images/house.png')
  # cities = new L.LayerGroup()

  $scope.enableResultsView = ->
    $scope.resultsview = true

  $scope.init = ->
    _loadLocationCrimeDetails()
    _initMap()
    # _loadMedicalLayer()


  _loadMedicalLayer = ->
    url = "https://data.medicare.gov/resource/hq9i-23gr.json?provider_state=WA"
    $http
      method: "GET"
      url: url
    .success (data, status) ->
      _paintMedicalLayer(data)


  _initMap = ->
    map = L.map('map', _options).setView([47.6094805,-122.3070454], 14)
    zoom = L.control.zoom
      position: 'bottomleft'
    tiles = L.tileLayer(tilesUrl, attributions)
    map.addControl(zoom)
    tiles.addTo(map)
    circle = L.circle([47.6255646, -122.3208213], 804.4, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map)

  _loadLocationCrimeDetails = ->
    $scope.loading = true

    crimeData.inRadius(47.6255646, -122.3208213, 804.4)
      .success (data, status) ->

        $scope.loading = false
        i = 0;
        newdata = {}
        crimes = []
        data.forEach (n) ->

          dt = new Date(n.date_reported)
          dm = "m#{dt.getUTCMonth()}y#{dt.getUTCFullYear()}"

          if dt.getUTCFullYear() is 2014
            hos = L.marker([n.latitude, n.longitude]).addTo(map)
            hos.bindPopup(n.hundred_block_location)


          if newdata[dm] is undefined
            newdata[dm] = {}
            newdata[dm].count = 0
            newdata[dm].date = new Date(dt.getUTCFullYear(), dt.getUTCMonth())
          else
            newdata[dm].count = newdata[dm].count + 1;

        dataToMap = []


        for index, val of newdata
          if val.date.getUTCFullYear() >= 2015
            console.log "Dont do anythin.."
          else
            dataToMap.push(val)

        MG.data_graphic
          title: "UFO Sightings"
          data: dataToMap
          width: 800
          height: 200
          target: '#graph'
          x_accessor: 'date'
          y_accessor: 'count'
        lr = L.marker([47.6255646, -122.3208213], {icon: houseIcon}).addTo(map)
        lr.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

  $scope.init()
