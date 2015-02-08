'use strict';

var http = require('http');
var Thing = require('./thing.model');

var toolkit = {};

toolkit.computeScore = function(incidents){
  var totalIncidents = incidents.length;

  return totalIncidents;
};

toolkit.computeSeattleScore = function(){
  this.getSeattleIncidents(function(incidents){
    console.log('seattle', incidents.length);
  });
};

toolkit.isSafe = function(incidents){
  var score = this.computeScore(incidents);
  return score > 500;
};

toolkit.getSeattleIncidents = function (callback) {
  var year = 2015;
  var limit = 10000;
  var params = "$where=year >= " + year + "&$limit=" + limit;

  this.getIncidents(params, callback);
};

toolkit.getLocationRange = function (location){
  return range = {
    longitudeMin: -122.3402731,
    longitudeMax: -122.3320708,
    latitudeMin: 47.6062095,
    latitudeMax: 47.6100497
  };
}

toolkit.getLocationIncidents = function (location, callback) {
  var limit = 2000;
  var year = 2015;
  var range = this.getLocationRange(location);

  var params = "$where=" +
    "latitude >= " + range.latitudeMin + " AND longitude <= " + range.latitudeMax + " AND " +
    "longitude >= " + range.longitudeMin + " AND longitude <= " + range.longitudeMax + " AND " +
    "year >= " + year +
    "&$limit=" + limit;

  this.getIncidents(params, callback);
};


toolkit.getIncidents = function(params, callback){
  var self;
  http.get('http://data.seattle.gov/resource/7ais-f98f.json?' + params, function(result) {
    var bodyChunks = [];
    result.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var incidents = JSON.parse(body);
      callback.call(self, incidents);
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

module.exports = toolkit;