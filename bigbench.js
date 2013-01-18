var config        = require('./config/config'),
    storage       = require('./modules/storage'),
    events        = require('./modules/events'),
    benchmark     = require('./modules/benchmark'),
    bot           = require('./modules/bot'),
    color         = require('./modules/color'),
    argument      = process.argv[2],
    argumentError = color.red + "ArgumentError: new, save, start or stop required" + color.reset;


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
    benchmark.resetData(function(){
      events.start("ALL", function(){ process.exit(1); });
    });
  }
  
  // Stop Benchmark
  if(argument === "stop"){
    events.stop("ALL", function(){ process.exit(1); });
  }
  
  // Help
  if(argument === "--help" || argument === "-h"){
    console.log("\n\
Usage: bigbench action [arguments]\n\
\n\
Actions:\n\
new                 // Create a benchmark skeleton\n\
save benchmark.js   // Global save the benchmark\n\
start               // Start the saved benchmark\n\
stop                // Stop the running benchmark\n\
    ");
    process.exit(1);
  }
  
  // Missing Argument
  if(!argument 
    || argument !== "new" 
    && argument !== "save" 
    && argument !== "start" 
    && argument !== "stop" 
    && argument !== "--help" 
    && argument !== "-h") throw argumentError;
});