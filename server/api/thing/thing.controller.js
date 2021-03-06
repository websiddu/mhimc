/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');
var Toolkit = require('./thing.toolkit');
var http = require('http');

// Get list of things
exports.index = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Thing.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.json(201, thing);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

exports.getsearch = function(req, res) {
  if(req.params.prefix) {
    http.get("http://ac.zillowstatic.com/getRegionByPrefix?prefix=" + req.params.prefix +"&json", function(result) {
      var bodyChunks = [];
      result.on('data', function(chunk) {
        bodyChunks.push(chunk);
      }).on('end', function() {
        var body = Buffer.concat(bodyChunks);
        return res.json(200, JSON.parse(body))
      })
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  }
};

exports.getLocation = function(req, res) {
  if(req.query.lat && req.query.long) {

    var location = {lat: req.query.lat, long: req.query.long};
    Toolkit.getLocationIncidentsRecords(location, function(incidentsRecords, lastMonthIncidents){
      Toolkit.findSeattleIncidentsRecords(function(seattleIncidentsRecords){

        var data = {
          isSafe:                  Toolkit.isSafe(seattleIncidentsRecords, incidentsRecords),
          incidentsRecords:        incidentsRecords,
          seattleIncidentsRecords: seattleIncidentsRecords,
          lastMonthIncidents:      lastMonthIncidents,
          config: {
            radiusM:       Toolkit.RADIUS_M,
            seattleAreaM2: Toolkit.SEATTLE_AREA_M2,
            coeff:         Toolkit.COEFF,
            nbYears:       Toolkit.NB_YEARS
          }
        };

        return res.json(200, data);
      });
    });
  }
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
