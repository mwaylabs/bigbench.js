#!/usr/bin/env node

var config        = require('../config/config'),
    storage       = require('../modules/storage'),
    events        = require('../modules/events'),
    series        = require('../modules/series'),
    benchmark     = require('../modules/benchmark'),
    bot           = require('../modules/bot'),
    color         = require('../modules/color'),
    logger        = require('../modules/logger'),
    argument      = process.argv[2],
    argumentError = color.red + "ArgumentError: new, save, reset, start or stop required" + color.reset;


// Setup
storage.open(function(){
  
  // Create Benchmark from Template
  if(argument === "new"){
    benchmark.createBenchmarkFromTemplate(function(){ process.exit(1); });
  }
  
  // Save Benchmark
  if(argument === "save"){
    benchmark.saveBenchmarkFromArgument(function(){ process.exit(1); });
  }
  
  // Test Benchmark
  if(argument === "test"){
    benchmark.testBenchmarkFromArgument(function(){ process.exit(1); });
  }
  
  // Start Benchmark
  if(argument === "start"){
    benchmark.setupAndStart(function(){ process.exit(1); });
    events.waitForStop(function(){
      if(benchmark.exiting()) return;
      benchmark.teardownAndStop(function(){ process.exit(1); });
    });
  }
  
  // Stop Benchmark
  if(argument === "stop"){
    events.stop("ALL", function(){ process.exit(1); });
  }
  
  // Reset Redis
  if(argument === "reset"){
    storage.redis.flushall(function(){
      logger.print("Benchmark", "Flushed Redis", color.green);
      process.exit(1);
    });
  }
  
  // Version
  if(argument === "--version" || argument === "-v"){
    var info = require('../package');
    console.log(color.green + "bigbench " + info.version + color.reset);
    process.exit(1);
  }
  
  // Help
  if(argument === "--help" || argument === "-h"){
    console.log("\n\
Usage: bigbench action [arguments]\n\
\n\
Actions:\n\
new                 // Create a benchmark skeleton\n\
save benchmark.js   // Global save the benchmark\n\
test benchmark.js   // Test run all benchmark actions\n\
reset               // Resets redis full incl. bots\n\
start               // Start the saved benchmark\n\
stop                // Stop the running benchmark\n\
    ");
    process.exit(1);
  }
  
  // Missing Argument
  if(!argument 
    || argument !== "new" 
    && argument !== "save" 
    && argument !== "test" 
    && argument !== "start" 
    && argument !== "stop" 
    && argument !== "reset" 
    && argument !== "--help" 
    && argument !== "-h") throw argumentError;
});

// Trap Exits
process.on('SIGINT', function(){
  benchmark.teardownAndStop(function(){ process.exit(1); }, false);
});

process.on('uncaughtException', function(err){
  logger.print("Benchmark", err, color.red);
  benchmark.teardownAndStop(function(){ process.exit(1); }, true);
});