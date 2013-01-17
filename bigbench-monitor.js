var config         = require('./config/config'),
    storage        = require('./modules/storage'),
    events         = require('./modules/events'),
    benchmark      = require('./modules/benchmark'),
    bot            = require('./modules/bot'),
    systemInterval = 5000,
    loadInterval   = 1000,
    lastRequests   = {},
    blue           = '\u001b[32m',
    reset          = '\u001b[0m',
    total          = 0,
    stopped        = 0,
    running        = 0;


// Setup
storage.open(function(){
  
  // Handle Events
  storage.redisForEvents.on("message", function (channel, message) {
    console.log(new Date().getTime() + "\t["+ blue + channel + reset + "]\t\t" + message);
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
      console.log(new Date().getTime() + "\t[" + blue + "bigbench_bots" + reset + "]\t\t\tTOTAL:" + total + " RUNNING:" + running + " STOPPED:" + stopped);
    });
  }, systemInterval);
  
  // Load
  setInterval(function(){
    if(running == 0){ return; }
    storage.redis.hgetall("bigbench_total", function(error, requests){
      var load = "", total = "";
      for (var status in requests){
        if(!lastRequests[status]){ lastRequests[status] = 0 }
        
        total += status + ":" + parseInt(requests[status]);
        load  += status + ":" + (parseInt(requests[status]) - parseInt(lastRequests[status])) / parseInt(loadInterval/1000) + " R/s ";
        lastRequests[status]  = parseInt(requests[status]);
      }
      console.log(new Date().getTime() + "\t[" + blue + "bigbench_total" + reset + "]\t\t" + total);
      console.log(new Date().getTime() + "\t[" + blue + "bigbench_load" + reset + "]\t\t\t" + load);
    });
  }, loadInterval);
});