'use strict'


angular.module 'mhimcApp'
.controller 'ResultsCtrl', ($scope, crimeData) ->

  $scope.showResult = true
  $scope.currentAddress = localStorage['current_loaction']
  $scope.loading = true
  circle = null
  seattledata = {"key":"Avg. Crimes in seattle","values":[[1325404800000, 45], [1328083200000, 41], [1330588800000,41],[1333263600000,42],[1335855600000,44],[1338534000000,45],[1341126000000,43],[1343804400000,46],[1346482800000,47],[1349074800000,44],[1351753200000,43],[1354348800000,40],[1357027200000,42],[1359705600000,46],[1362124800000,40],[1364799600000,46],[1367391600000,45],[1370070000000,51],[1372662000000,48],[1375340400000,52],[1378018800000,51],[1380610800000,50],[1383289200000,53],[1385884800000,50],[1388563200000,48],[1391241600000,51],[1393660800000,43],[1396335600000,61],[1398927600000,58],[1401606000000,55],[1404198000000,57],[1406876400000,88],[1409554800000,98],[1412146800000,88],[1414825200000,81],[1417420800000,45],[1420099200000,44],[1422777600000,53]],"color":"red"}
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
