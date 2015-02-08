'use strict';

var http = require('http');
var q = require('q');
var _ = require('lodash');
var IncidentsRecord = require('../incidentsRecord/incidentsRecord.model');
var incidentTypes = require('./thing.incidentTypes');

var toolkit = {
  RADIUS_M: 804,
  SEATTLE_AREA_M2: 217200000,
  COEFF: 1
};

toolkit.computeScore = function(incidentsRecords){
  return _.reduce(incidentsRecords, function (sum, incidentsRecord) {
    return sum + incidentsRecord.totalIncidents;
  }, 0);
};

toolkit.incidentsToIncidentsRecord = function(month, year, incidents){
  var self = this;
  var incidentsRecord = {
    month: month,
    year: year,
    date: new Date(year, month),
    totalIncidents: incidents.length,
    totalIncidentsOther: 0,
    totalIncidentsProperty: 0,
    totalIncidentsViolentCrime: 0,
    totalIncidentsPublicPeace: 0
  };

  _.forEach(incidents, function (incident) {
    incidentsRecord['totalIncidents' + self.getIncidentType(incident)]++;
  });

  return incidentsRecord;
};

toolkit.getDates = function(){
  var years = 1;
  var today = new Date();
  var currentMonth = today.getMonth() + 1;
  var currentYear = today.getFullYear();
  var dates = [];

  for (var i = 1; i <= (years*12); i++) {
    currentMonth = (currentMonth - 1 > 0 ? currentMonth - 1 : 12);
    currentYear = (currentMonth == 12 ? currentYear - 1 : currentYear);
    dates.push({
      year: currentYear,
      month: currentMonth
    });
  };
  return dates;
};

toolkit.computeSeattleIncidentsRecords = function(){
  var self = this;
  IncidentsRecord.count({}, function (err, count){
    console.log('count=', count);
    if (count == 0){
      _.forEach(this.getDates(), function (date){
        self.getSeattleIncidents(date.month, date.year, function(incidents){
          console.log('Seattle incidents', date.month, date.year, incidents.length);
          _.forEach(incidents, function (incident){
            IncidentsRecord.create(self.incidentsToIncidentsRecord(date.month, date.year, incidents));
          });
        });
      });
    };
  });
};

toolkit.isSafe = function(seattleIncidentsRecords, incidentsRecords){
  var score = this.computeScore(incidentsRecords);
  var seattleScore = this.computeScore(seattleIncidentsRecords);
  var locationArea = this.RADIUS_M*this.RADIUS_M*Math.PI;
  console.log(this.SEATTLE_AREA_M2, score, locationArea, seattleScore, '====', this.SEATTLE_AREA_M2*score, this.COEFF*locationArea*seattleScore);
  return this.SEATTLE_AREA_M2*score < this.COEFF*locationArea*seattleScore;
};

toolkit.findSeattleIncidentsRecords = function(callback){
  var self = this;
  q.all(_.map(this.getDates(), function(date){
    var deferred = q.defer();
    self.findSeattleIncidentsRecord(date.month, date.year, function(incidentsRecord){
      deferred.resolve(incidentsRecord);
    });
    return deferred.promise;
  })).then(function(incidentsRecords){
    callback.call(self, incidentsRecords);
  });
};

toolkit.findSeattleIncidentsRecord = function(month, year, callback) {
  var self = this;
  IncidentsRecord.findOne({month: month, year: year}, function (err, incidentsRecord) {
    if(err) { console.log('error loading SeattleIncidentsRecord ') };
    if(!incidentsRecord) {
      var msg = 'error no SeattleIncidentsRecord for month ' + month + ' and year ' + year;
      console.log(msg);
    };
    callback.call(self, incidentsRecord);
  });
};

toolkit.getSeattleIncidents = function (month, year, callback) {
  var limit = 50000;
  var params = "$where= year = " + year + " AND month = " + month + "&$limit=" + limit;

  this.getIncidents(params, callback);
};

toolkit.getLocationIncidentsRecords = function (location, callback) {
  var self = this;
  var dates = this.getDates();
  var date = _.last(dates);

  this.getLocationIncidentsAfterDate(location, date, function (incidents){
    var incidentsRecords = _.map(dates, function(date){
      var monthlyIncidents = _.filter(incidents, function(incident){
        return (date.year == parseInt(incident.year, 10) && date.month == parseInt(incident.month, 10));
      });
      return self.incidentsToIncidentsRecord(date.month, date.year, monthlyIncidents);
    });
    callback.call(self, incidentsRecords);
  });
};

toolkit.getLocationIncidentsAfterDate = function (location, date, callback) {
  var limit = 50000;
  var params = "$where=within_circle(location," + location.lat + "," + location.long + "," + this.RADIUS_M + ") AND year>=2011&$limit=" + limit;

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

toolkit.getIncidentType = function(incident){
  var incidentType = incidentTypes[incident.summarized_offense_description];
  if (!incidentType){ incidentType = 'Other'};
  return incidentType;
};

module.exports = toolkit;