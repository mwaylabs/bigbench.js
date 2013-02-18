#!/usr/bin/env node

var config         = require('../config/config'),
    storage        = require('../modules/storage'),
    color          = require('../modules/color'),
    logger         = require('../modules/logger'),
    isRunning      = false,
    systemInterval = 5000,
    loadInterval   = 1000,
    total          = 0,
    stopped        = 0,
    running        = 0,
    lastRequests   = {};

// Currently running bots
var systemUpdate = function(){
  storage.redis.hgetall("bigbench_bots", function(error, bots){
    total = 0; stopped = 0; running = 0;
    for (var bot in bots){
      total++;
      if(bots[bot] === "STOPPED"){ stopped++; }
      if(bots[bot] === "RUNNING"){ running++; }
    }
    logger.printLine("bigbench_bots", color.cyan + "TOTAL:" + total + " RUNNING:" + running + " STOPPED:" + stopped + color.reset);
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
    
    logger.printLine("bigbench_progress", color.magenta + "PROGRESS:" + progress + " % TIMELEFT:" + timeLeft + " s" + color.reset);
  });
}

// Setup
storage.open(function(){
  
  // Status
  storage.redis.get("bigbench_status", function(err, status){ isRunning = (status === "RUNNING"); });
  
  // Handle Events
  storage.redisForEvents.on("message", function (channel, message) {
    logger.printLine(channel, message);
    if(channel == "bigbench_status"){ isRunning = (message === "RUNNING"); }
  });
  
  // Subscribe
  storage.redisForEvents.subscribe(
    "bigbench_status",
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