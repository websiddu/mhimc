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

exports.getincidents = function(req, res) {
  if(req.query.lat && req.query.long) {

    var limit = 2000;
    var year = 2015;
    var range = {
      longitudeMin: -122.3402731,
      longitudeMax: -122.3320708,
      latitudeMin: 47.6062095,
      latitudeMax: 47.6100497
    };

    var params = "$where=" +
      "latitude >= " + range.latitudeMin + " AND longitude <= " + range.latitudeMax + " AND " +
      "longitude >= " + range.longitudeMin + " AND longitude <= " + range.longitudeMax + " AND " +
      "year >= " + year +
      "&$limit=" + limit;


    http.get('http://data.seattle.gov/resource/7ais-f98f.json?' + params, function(result) {
      var bodyChunks = [];
      result.on('data', function(chunk) {
        bodyChunks.push(chunk);
      }).on('end', function() {


        var body = Buffer.concat(bodyChunks);
        var incidents = JSON.parse(body);

        var isSafe = Toolkit.isSafe(incidents);
        return res.json(200, isSafe)
      })
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
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
