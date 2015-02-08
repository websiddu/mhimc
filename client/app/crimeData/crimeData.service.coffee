'use strict'

angular.module 'mhimcApp'
.service 'crimeData', ($http) ->

  inRadius: (lat, lon, radius) ->
    query = "?$where=within_circle(location,#{lat},#{lon},#{radius}) AND year>2011&$limit=20000"
    $http
      url: "https://data.seattle.gov/resource/7ais-f98f.json#{query}"
      method: 'GET'
      headers:
        "X-App-Token": 'FBAWy5PxzAcIlGEyOXSMflGBc'
