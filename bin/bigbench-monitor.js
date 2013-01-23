#!/usr/bin/env node

var config         = require('../config/config'),
    storage        = require('../modules/storage'),
    events         = require('../modules/events'),
    benchmark      = require('../modules/benchmark'),
    bot            = require('../modules/bot'),
    color          = require('../modules/color'),
    isRunning      = false,
    systemInterval = 5000,
    loadInterval   = 1000,
    total          = 0,
    stopped        = 0,
    running        = 0,
    lastRequests   = {};


// Setup
storage.open(function(){
  
  // Status
  setInterval(function(){
    storage.redis.get("bigbench_status", function(err, status){
      isRunning = (status === "RUNNING");
    });
  }, 1000);
  
  // Handle Events
  storage.redisForEvents.on("message", function (channel, message) {
    printLine(channel, message);
  });
  
  // Subscribe
  storage.redisForEvents.subscribe(
    "bigbench_bots_start", 
    "bigbench_bots_stop", 
    "bigbench_bots_status", 
    "bigbench_benchmark_saved",
    "bigbench_total_series",
    "bigbench_total_duration_series",
    "bigbench_statistics",
    "bigbench_timing"
  );
  
  // System & Progress Schedule
  setInterval(systemUpdate, systemInterval);
  setInterval(progressUpdate, systemInterval);
  
  // Initial Call
  systemUpdate();
  progressUpdate();
});

// Currently running bots
var systemUpdate = function(){
  storage.redis.hgetall("bigbench_bots", function(error, bots){
    total = 0; stopped = 0; running = 0;
    for (var bot in bots){
      total++;
      if(bots[bot] === "STOPPED"){ stopped++; }
      if(bots[bot] === "RUNNING"){ running++; }
    }
    printLine("bigbench_bots", color.cyan + "TOTAL:" + total + " RUNNING:" + running + " STOPPED:" + stopped + color.reset);
  });
}

// Progress if running
var progressUpdate = function(){
  if(!isRunning) return;
  storage.redis.hgetall("bigbench_timing", function(error, timing){
    var now      = new Date().getTime(),
        timeLeft = parseInt((parseInt(timing["STOP"]) - now) / 1000),
        progress = 100 - parseInt((parseInt(timing["STOP"]) - now) / (parseInt(timing["STOP"]) - parseInt(timing["START"])) * 100);
    
    if(progress > 100){ progress = 100; }
    if(progress < 0)  { progress = 0; }
    
    printLine("bigbench_progress", color.magenta + "PROGRESS:" + progress + " % TIMELEFT:" + timeLeft + " s" + color.reset);
  });
}

// Round float numbers
var numberFormat = function(number){
  var rounded = Math.round(number * Math.pow(10,2)) / Math.pow(10,2);
  return rounded;
}

// Prints an output line with date and format
var printLine = function(label, content){
  var time    = new Date().getTime(),
      longest = 32,
      fillup  = longest - label.length,
      output  = "";
      
  output += time;
  output += "    [" + color.green + label + color.reset + "]";
  for (var i=0; i < fillup; i++) { output += " " };
  output += content;
  
  console.log(output);
}