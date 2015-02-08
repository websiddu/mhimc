'use strict'


angular.module 'mhimcApp'
.controller 'ResultsCtrl', ($scope, crimeData, $location) ->

  $scope.showResult = false
  $scope.showDeatils = false
  $scope.currentAddress = localStorage['current_loaction']
  $scope.loading = true
  circle = null
  seattledata = {"key":"Avg. Crimes in seattle","values":[[1325404800000, 62], [1328083200000, 59], [1330588800000,62],[1333263600000,64],[1335855600000,67],[1338534000000,68],[1341126000000,65],[1343804400000,70],[1346482800000,71],[1349074800000,67],[1351753200000,65],[1354348800000,61],[1357027200000,64],[1359705600000,69],[1362124800000,61],[1364799600000,71],[1367391600000,68],[1370070000000,77],[1372662000000,73],[1375340400000,79],[1378018800000,77],[1380610800000,75],[1383289200000,81],[1385884800000,76],[1388563200000,73],[1391241600000,78],[1393660800000,65],[1396335600000,93],[1398927600000,88],[1401606000000,84],[1404198000000,87],[1406876400000,134],[1409554800000,149],[1412146800000,133],[1414825200000,124],[1417420800000,68],[1420099200000,67],[1422777600000,81]],"color":"red"}
  seatteltotal = 2976;

  $scope.showDrilldown = false;

  locationArea = 804.2 * 804.2 * Math.PI;
  seattleAvgIndex = Math.round(seatteltotal/143);
  $scope.data = null;

  $scope.isSafe = true;
  $scope.result = '';


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


  $scope.toggleChart = ->
    $scope.showDrilldown = !$scope.showDrilldown
    nv.addGraph ->
      rt = nv.models.stackedAreaChart()
        .margin({right: 100})
        .x((d) -> d[0])
        .y((d) -> d[1])
        .showControls(true)
        .clipEdge(true)
        .useInteractiveGuideline(true)


        # .margin(right: 100)
        # .useInteractiveGuideline(true)
        # .rightAlignYAxis(true)
        # .showControls(true)
        # .clipEdge(true)

      rt.xAxis.tickFormat (d) ->
        d3.time.format('%b %Y') new Date(d)

      rt.yAxis.tickFormat d3.format('f')

      d3.select('#chart1 svg').datum([$scope.data.chart[0], $scope.data.chart[1], $scope.data.chart[2], $scope.data.chart[3]]).call rt

      nv.utils.windowResize rt.update
      return



  _loadLocationCrimeDetails = ->
    $scope.loading = true

    crimeData.inRadius(localStorage['lat'], localStorage['lng'], 804.4)
      .success (data, status) ->
          $scope.data = data;
          # data.chart.push(seattledata)

          if data.supertotal > seatteltotal
            $scope.isSafe = false;
            $scope.result = "No"
          else
            $scope.result = "Yes"
            $scope.isSafe = true

          $scope.showResult = true

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

            d3.select('#chart svg').datum([seattledata, data.chart[4]]).call chart

            nv.utils.windowResize chart.update
            return

          data.mapdata.forEach (n) ->
            hos = L.marker([parseFloat(n.location.latitude), parseFloat(n.location.longitude)]).addTo(map)
            hos.bindPopup(n.hundred_block_location)
            $scope.loading = false




  $scope.init()
