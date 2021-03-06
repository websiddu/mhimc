'use strict'

angular.module 'mhimcApp'
.service 'crimeData', ($http) ->

  inRadius: (lat, lon, radius) ->
    query = "?$where=within_circle(location,#{lat},#{lon},#{radius}) AND year>2011&$limit=20000"
    url = "/api/things/location?lat=#{lat}&long=#{lon}&radius=#{radius}"
    url = "/api/crimes/#{lat}/#{lon}/804"
    $http
      #url: "https://data.seattle.gov/resource/7ais-f98f.json#{query}"
      url: url
      method: 'GET'
      headers:
        "X-App-Token": 'FBAWy5PxzAcIlGEyOXSMflGBc'

  setattleData: ->
    $http
      #url: "https://data.seattle.gov/resource/7ais-f98f.json#{query}"
      url: "/api/crimes/seattle"
      method: 'GET'
