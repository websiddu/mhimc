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