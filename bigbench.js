var config        = require('./config/config'),
    storage       = require('./modules/storage'),
    events        = require('./modules/events'),
    benchmark     = require('./modules/benchmark'),
    bot           = require('./modules/bot'),
    argument      = process.argv[2],
    argumentError = "Missing Argument. Please supply new, start, stop, benchmark.js or a 'benchmark string'.";


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
  
  // Start Benchmark
  if(argument === "start"){
    events.start("ALL", function(){ process.exit(1); });
  }
  
  // Stop Benchmark
  if(argument === "stop"){
    events.stop("ALL", function(){ process.exit(1); });
  }
  
  
  // Missing Argument
  //throw argumentError;
});