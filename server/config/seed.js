/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var toolkit = require('../api/thing/thing.toolkit');

toolkit.computeSeattleIncidentsRecords();