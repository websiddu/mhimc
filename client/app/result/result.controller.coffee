'use strict'

angular.module 'mhimcApp'
.controller 'ResultCtrl', ($scope) ->
  _options =
    maxZoom: 5
    minZoom: 3
    # maxBounds: bounds
    zoomControl: false

  tilesUrl = "https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png"
  attributions =
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-20v6611k'


  $scope.init = ->
    _initMap()

  _initMap = ->
    map = L.map('map', _options).setView([36.421, -71.411], 4)
    zoom = L.control.zoom
      position: 'bottomleft'
    tiles = L.tileLayer(tilesUrl, attributions)
    map.addControl(zoom)
    tiles.addTo(map)

  $scope.init()
