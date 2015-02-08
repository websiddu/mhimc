'use strict'

angular.module 'mhimcApp'
.controller 'ResultsCtrl', ($scope, crimeData) ->

  $scope.showResult = true
  $scope.currentAddress = localStorage['current_loaction']
  $scope.loading = true
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

  L.Icon.Default.imagePath = '/assets/images/'

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

  $scope.enableshowResult = ->
    $scope.showResult = false

  $scope.init = ->
    _loadLocationCrimeDetails()
    _initMap()

  _initMap = ->
    map = L.map('map', _options).setView([localStorage['lat'], localStorage['lng']], 14)
    zoom = L.control.zoom
      position: 'bottomleft'
    tiles = L.tileLayer(tilesUrl, attributions)
    # map.addControl(zoom)
    tiles.addTo(map)
    circle = L.circle([localStorage['lat'], localStorage['lng']], 804.4, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map)

    lr = L.marker([localStorage['lat'], localStorage['lng']], {icon: houseIcon}).addTo(map)
    #lr.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();


  _loadLocationCrimeDetails = ->
    $scope.loading = true

    crimeData.inRadius(localStorage['lat'], localStorage['lng'], 804.4)
      .success (data, status) ->
        crimeData.setattleData()
          .success (seattledata, status) ->
            data.chart.push(seattledata)

            nv.addGraph ->
              chart = nv.models.lineChart()
                .x((d) -> d[0])
                .y((d) -> d[1])
                .options({
                  transitionDuration: 300,
                  useInteractiveGuideline: true
                })

                # .margin(right: 100)
                # .useInteractiveGuideline(true)
                # .rightAlignYAxis(true)
                # .showControls(true)
                # .clipEdge(true)

              chart.xAxis.tickFormat (d) ->
                d3.time.format('%b %Y') new Date(d)

              chart.yAxis.tickFormat d3.format('f')

              d3.select('#chart svg').datum(data.chart).call chart

              nv.utils.windowResize chart.update
              return

            data.mapdata.forEach (n) ->
              hos = L.marker([parseFloat(n.location.latitude), parseFloat(n.location.longitude)]).addTo(map)
              hos.bindPopup(n.hundred_block_location)
              $scope.loading = false




  $scope.init()
