#!/usr/bin/env node

var config  = require('../config/config'),
    storage = require('../modules/storage'),
    color   = require('../modules/color'),
    io      = require('socket.io').listen(config.websocket.port);

// Setup
storage.open(function(){
  
  // Handle Events
  storage.redisForEvents.on("pmessage", function (pattern, channel, message) {
    io.sockets.emit(channel, message);
  });
  
  // Subscribe
  storage.redisForEvents.psubscribe("bigbench_*");
  
  // Print Status
  console.log(color.green + "Ready" + color.reset);
});