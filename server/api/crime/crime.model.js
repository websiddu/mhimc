'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CrimeSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Crime', CrimeSchema);