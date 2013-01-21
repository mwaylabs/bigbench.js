#!/usr/bin/env node

var config    = require('../config/config'),
    storage   = require('../modules/storage'),
    events    = require('../modules/events'),
    benchmark = require('../modules/benchmark'),
    bot       = require('../modules/bot'),
    color     = require('../modules/color');

// Setup
storage.open(function(){
  
  // Register
  bot.register();
  
  // Print Ready
  console.log(color.green + bot.id() + " Ready" + color.reset);
  
  // Wait for Start
  events.waitForStart(function(){
    benchmark.run();
  });
  
  // Wait for Stop
  events.waitForStop(function(){
    benchmark.stop();
  });
  
});

// Trap Exits
process.on('SIGINT', function(){
  bot.unregister();
  process.exit(1);
});

process.on('uncaughtException', function(err){
  console.log(color.red + err + color.reset);
  bot.unregister();
  process.exit(1);
});