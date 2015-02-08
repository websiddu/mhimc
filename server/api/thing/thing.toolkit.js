'use strict';

var http = require('http');
var q = require('q');
var _ = require('lodash');
var IncidentsRecord = require('../incidentsRecord/incidentsRecord.model');
var incidentTypes = require('./thing.incidentTypes');

var toolkit = {
  RADIUS_M: 804,
  SEATTLE_AREA_M2: 143000000,
  COEFF: 1.25,
  NB_YEARS: 3
};


toolkit.computeScore = function(incidentsRecords, seattleFlag){
  var totalIncidents = _.reduce(incidentsRecords, function (sum, incidentsRecord) {
    return sum + incidentsRecord.totalIncidents;
  }, 0);
  if (seattleFlag){ return this.seattleAverageIncidents(totalIncidents);};
  return totalIncidents;
};

toolkit.seattleAverageIncidents = function(totalIncidents){
  var locationArea = this.RADIUS_M*this.RADIUS_M*Math.PI;
  return Math.round((totalIncidents*locationArea)/this.SEATTLE_AREA_M2);
}

toolkit.incidentsToIncidentsRecord = function(month, year, incidents, seattleFlag){
  var self = this;
  var iR = {
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
    iR['totalIncidents' + self.getIncidentType(incident)]++;
  });

  if (!seattleFlag){ return iR;};

  iR.averageIncidents             = this.seattleAverageIncidents(iR.totalIncidents);
  iR.averageIncidentsOther        = this.seattleAverageIncidents(iR.totalIncidentsOther);
  iR.averageIncidentsProperty     = this.seattleAverageIncidents(iR.totalIncidentsProperty);
  iR.averageIncidentsViolentCrime = this.seattleAverageIncidents(iR.totalIncidentsViolentCrime);
  iR.averageIncidentsPublicPeace  = this.seattleAverageIncidents(iR.totalIncidentsPublicPeace);

  return iR;
};

toolkit.getDates = function(){
  var today = new Date();
  var currentMonth = today.getMonth() + 1;
  var currentYear = today.getFullYear();
  var dates = [];

  for (var i = 1; i <= (this.NB_YEARS*12); i++) {
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
  // IncidentsRecord.remove({}, function(){
  // });
  _.forEach(self.getDates(), function (date){
    self.findSeattleIncidentsRecord(date.month, date.year, function(incidentsRecord){
      if (!incidentsRecord){
        self.getSeattleIncidents(date.month, date.year, function(incidents){
          console.log('Seattle incidents fetched: ', date.month + '/' + date.year, 'nb: ', incidents.length);
          IncidentsRecord.create(self.incidentsToIncidentsRecord(date.month, date.year, incidents, true));
        });
      }
    });
  });
};

toolkit.isSafe = function(seattleIncidentsRecords, incidentsRecords){
  var score = this.computeScore(incidentsRecords);

  var seattleScore = this.computeScore(seattleIncidentsRecords, true);
  console.log('seattleScore:', seattleScore, 'score:', score);
  return score < this.COEFF*seattleScore;
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
      var monthlyIncidents = self.incidentsAtDate(incidents, date);
      return self.incidentsToIncidentsRecord(date.month, date.year, monthlyIncidents);
    });
    var lastMonthIncidents = self.incidentsAtDate(incidents, _.first(dates));
    _.forEach(lastMonthIncidents, function(lastMonthIncident){
      lastMonthIncident.incidentType = self.getIncidentType(lastMonthIncident);
    });
    callback.call(self, incidentsRecords, lastMonthIncidents);
  });
};

toolkit.incidentsAtDate = function (incidents, date) {
  return _.filter(incidents, {
    year:  date.year.toString(),
    month: date.month.toString()
  });
};

toolkit.getLocationIncidentsAfterDate = function (location, date, callback) {
  var limit = 50000;
  var params = "$where=within_circle(location," + location.lat + "," + location.long + "," + this.RADIUS_M + ") AND year>2011&$limit=" + limit;

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
