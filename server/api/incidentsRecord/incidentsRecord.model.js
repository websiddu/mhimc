'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IncidentsRecordSchema = new Schema({
  month: Number,
  year: Number,
  date: Date,
  totalIncidents: Number,
  totalIncidentsOther: Number,
  totalIncidentsProperty: Number,
  totalIncidentsViolentCrime: Number,
  totalIncidentsPublicPeace: Number

});

module.exports = mongoose.model('IncidentsRecord', IncidentsRecordSchema);
