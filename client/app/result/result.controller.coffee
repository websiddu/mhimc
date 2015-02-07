'use strict'

angular.module 'mhimcApp'
.controller 'ResultCtrl', ($scope, $http) ->
  _options =
    # maxBounds: bounds
    zoomControl: false
  map = null
  tilesUrl = "https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png"
  attributions =
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-20v6611k'

  cities = new L.LayerGroup()

  $scope.init = ->
    _initMap()
    _loadMedicalLayer()

  _loadMedicalLayer = ->
    url = "https://data.medicare.gov/resource/hq9i-23gr.json?provider_state=WA"
    $http
      method: "GET"
      url: url
    .success (data, status) ->
      _paintMedicalLayer(data)

  _paintMedicalLayer = (data) ->
    hospitials = []
    data.forEach (val) ->
      hos = L.marker([val.location.latitude, val.location.longitude]).bindPopup('This is Littleton, CO.')
      hospitials.push(hos)

    cities = L.layerGroup(hospitials);
    map.addLayer(cities)




  _initMap = ->
    map = L.map('map', _options).setView([36.421, -71.411], 4)
    zoom = L.control.zoom
      position: 'bottomleft'
    tiles = L.tileLayer(tilesUrl, attributions)
    map.addControl(zoom)
    tiles.addTo(map)

  $scope.init()
