'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IncidentsRecordSchema = new Schema({
  month: Number,
  year: Number,
  totalIncidents: Number
});

module.exports = mongoose.model('IncidentsRecord', IncidentsRecordSchema);
