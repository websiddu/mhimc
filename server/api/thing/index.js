'use strict';

var express = require('express');
var controller = require('./thing.controller');

var router = express.Router();

// router.get('/', controller.index);
// router.get('/:id', controller.show);
router.get('/search/:prefix', controller.getsearch);
router.get('/location', controller.getLocation);

router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
