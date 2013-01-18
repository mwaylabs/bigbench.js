var config         = require('./config/config'),
    storage        = require('./modules/storage'),
    events         = require('./modules/events'),
    benchmark      = require('./modules/benchmark'),
    bot            = require('./modules/bot'),
    color          = require('./modules/color'),
    systemInterval = 5000,
    loadInterval   = 1000,
    total          = 0,
    stopped        = 0,
    running        = 0,
    lastRequests   = {};


// Setup
storage.open(function(){
  
  // Handle Events
  storage.redisForEvents.on("message", function (channel, message) {
    console.log(new Date().getTime() + "\t["+ color.green + channel + color.reset + "]\t\t" + message);
  });
  
  // Subscribe
  storage.redisForEvents.subscribe(
    "bigbench_bots_start", 
    "bigbench_bots_stop", 
    "bigbench_bots_status", 
    "bigbench_benchmark_saved"
  );
  
  // System
  setInterval(function(){
    storage.redis.hgetall("bigbench_bots", function(error, bots){
      total = 0; stopped = 0; running = 0;
      for (var bot in bots){
        total++;
        if(bots[bot] === "STOPPED"){ stopped++; }
        if(bots[bot] === "RUNNING"){ running++; }
      }
      console.log(new Date().getTime() + "\t[" + color.green + "bigbench_bots" + color.reset + "]\t\t\tTOTAL:" + total + " RUNNING:" + running + " STOPPED:" + stopped);
    });
  }, systemInterval);
  
  // Load
  setInterval(function(){
    if(running == 0){ return; }
    storage.redis.hgetall("bigbench_total", function(error, requests){
      storage.redis.hgetall("bigbench_total_duration", function(error2, durations){
        var load = "", total = "", duration = "";
        for (var status in requests){
          if(!lastRequests[status]){ lastRequests[status] = 0 }
        
          total     += status + ":" + numberFormat(parseInt(requests[status]));
          duration  += status + ":" + numberFormat(parseInt(durations[status]) / parseInt(requests[status])) + " ms avg";
          load      += status + ":" + numberFormat((parseInt(requests[status]) - parseInt(lastRequests[status])) / parseInt(loadInterval/1000)) + " R/s ";
          lastRequests[status]  = parseInt(requests[status]);
        }
        console.log(new Date().getTime() + "\t[" + color.green + "bigbench_total" + color.reset + "]\t\t" + total);
        console.log(new Date().getTime() + "\t[" + color.green + "bigbench_load" + color.reset + "]\t\t\t" + load);
        console.log(new Date().getTime() + "\t[" + color.green + "bigbench_duration" + color.reset + "]\t\t" + duration);
      });
    });
  }, loadInterval);
  
  // Progress
  setInterval(function(){
    storage.redis.hgetall("bigbench_timing", function(error, timing){
      var now = new Date().getTime();
      if(!timing || now > parseInt(timing["STOP"])) return;
      var timeLeft = parseInt((parseInt(timing["STOP"]) - now) / 1000),
          progress = 100 - parseInt((parseInt(timing["STOP"]) - now) / (parseInt(timing["STOP"]) - parseInt(timing["START"])) * 100);
      
      if(progress > 100){ progress = 100; }
      if(progress < 0)  { progress = 0; }
      
      console.log(new Date().getTime() + "\t[" + color.green + "bigbench_progress" + color.reset + "]\t\tPROGRESS:" + progress + " % TIMELEFT:" + timeLeft + " s");
    });
  }, systemInterval);
});

// Round float numbers
var numberFormat = function(number){
  var rounded = Math.round(number * Math.pow(10,2)) / Math.pow(10,2);
  return rounded;
}