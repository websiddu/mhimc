/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Crime = require('./crime.model');

exports.register = function(socket) {
  Crime.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Crime.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('crime:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('crime:remove', doc);
}