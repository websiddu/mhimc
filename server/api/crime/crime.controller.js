'use strict';

var _ = require('lodash');
var Crime = require('./crime.model');
var http = require('http');
var incidentTypes = require('../thing/thing.incidentTypes');
var IncidentsRecord = require('../incidentsRecord/incidentsRecord.model');

// Get list of crimes
exports.index = function(req, res) {
  Crime.find(function (err, crimes) {
    if(err) { return handleError(res, err); }
    return res.json(200, crimes);
  });
};

// Get a single crime
exports.show = function(req, res) {
  Crime.findById(req.params.id, function (err, crime) {
    if(err) { return handleError(res, err); }
    if(!crime) { return res.send(404); }
    return res.json(crime);
  });
};


exports.getseattledata = function(req, res) {
  IncidentsRecord.find(function (err, crimes) {
    if(err) { return handleError(res, err); }
    var seattle = {
        key: 'Avg. Crimes in seattle',
        values: [],
        color: 'red'
      };

    crimes.forEach(function(val){
      seattle.values.push([val.date.getTime(), val.averageIncidents]);
    });

    seattle.values =  _.sortBy(seattle.values, function(n) { return n[0]});

    return res.json(200, seattle);
  });
}


exports.getcrimedata = function(req, res) {
  var limit = 50000;
  var params = "$where=within_circle(location," + req.params.lat + "," + req.params.lng + "," + req.params.rad + ") AND year>2011&$limit=" + limit;

  http.get('http://data.seattle.gov/resource/7ais-f98f.json?' + params, function(result) {
    var bodyChunks = [];
    result.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var incidents = JSON.parse(body);
      _parseData(incidents);
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

  var _parseData = function(data) {

    var dataToMap, dm, dt, hos, index, val, newdata = [], crimelocaitons = [];

    data.forEach(function(n) {
      dt = new Date(n.occurred_date_or_date_range_start);
      dm = "m" + (dt.getUTCMonth()) + "y" + (dt.getUTCFullYear());

      if (newdata[dm] === void 0) {
        newdata[dm] = {};
        newdata[dm].count = 0;
        newdata[dm].offence = {
          'PublicPeace': 0,
          'ViolentCrime': 0,
          'Property': 0,
          'Other': 0
        };
        //newdata[dm].offence = {}
        newdata[dm].date = new Date(dt.getUTCFullYear(), dt.getUTCMonth());
      } else {
        newdata[dm].count = newdata[dm].count + 1;
        if(dt.getUTCFullYear() == 2014 && dt.getUTCMonth() > 5) {
          var crimeinfo = {
            location: n.location,
            hundred_block_location: n.hundred_block_location,
            offense_type: n.offense_type,
            summary_type: incidentTypes[n.summarized_offense_description.trim()] || 'Other'
          }

          crimelocaitons.push(crimeinfo);
        }

        if(newdata[dm].offence[incidentTypes[n.summarized_offense_description.trim()] || 'Other'] == undefined)
          newdata[dm].offence[incidentTypes[n.summarized_offense_description.trim()] || 'Other'] = 1
        else
          newdata[dm].offence[incidentTypes[n.summarized_offense_description.trim()] || 'Other']++;

        // if(newdata[dm].offence[n.summarized_offense_description.trim()] == undefined)
        //   newdata[dm].offence[n.summarized_offense_description.trim()] = 1
        // else
        //   newdata[dm].offence[n.summarized_offense_description.trim()]++;

      }

    });

    dataToMap = [];

    var datawithkeys = {
      'PublicPeace': {
        key: 'Public Peace',
        values: []
      },
      'ViolentCrime': {
        key: 'Violent Crime',
        values: []
      },
      'Property': {
        key: 'Property',
        values: []
      },
      'Other': {
        key: 'Other',
        values: []
      }

    };

    for (index in newdata) {
      val = newdata[index];
      datawithkeys['PublicPeace'].values.push([val.date.getTime(), val.offence['PublicPeace']])
      datawithkeys['ViolentCrime'].values.push([val.date.getTime(), val.offence['ViolentCrime']])
      datawithkeys['Property'].values.push([val.date.getTime(), val.offence['Property']])
      datawithkeys['Other'].values.push([val.date.getTime(), val.offence['Other']])
      // datawithkeys['Total'].values.push([val.date.getTime(), val.offence['Total']])
      if (val.date.getUTCFullYear() >= 2015) {
        console.log("Dont do anythin..");
      } else {
        dataToMap.push(val);
      }
    }

    var datawioutkeys = []
    for (index in datawithkeys) {
      datawithkeys[index].values = _.sortBy(datawithkeys[index].values, function(n) { return n[0]});
      datawioutkeys.push(datawithkeys[index]);
    }

    return res.json(200, {chart: datawioutkeys, mapdata: crimelocaitons});
  }

}


// Creates a new crime in the DB.
exports.create = function(req, res) {
  Crime.create(req.body, function(err, crime) {
    if(err) { return handleError(res, err); }
    return res.json(201, crime);
  });
};

// Updates an existing crime in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Crime.findById(req.params.id, function (err, crime) {
    if (err) { return handleError(res, err); }
    if(!crime) { return res.send(404); }
    var updated = _.merge(crime, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, crime);
    });
  });
};

// Deletes a crime from the DB.
exports.destroy = function(req, res) {
  Crime.findById(req.params.id, function (err, crime) {
    if(err) { return handleError(res, err); }
    if(!crime) { return res.send(404); }
    crime.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
