#!/usr/bin/env node

var config  = require('../config/config'),
    storage = require('../modules/storage'),
    color   = require('../modules/color'),
    io      = require('socket.io').listen(config.websocket.port, { log: false });

// Setup
storage.open(function(){
  
  // Handle Events
  storage.redisForEvents.on("pmessage", function (pattern, channel, message) {
    var clients = io.sockets.clients() || [];
    for(var index in clients){
      clients[index].emit(channel, message);
    }
  });
  
  // Subscribe
  storage.redisForEvents.psubscribe("bigbench_*");
  
  // Print Status
  console.log(color.green + "Ready" + color.reset);
});