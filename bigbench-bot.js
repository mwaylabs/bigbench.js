var config    = require('./config/config'),
    storage   = require('./modules/storage'),
    events    = require('./modules/events'),
    benchmark = require('./modules/benchmark'),
    bot       = require('./modules/bot'),
    blue      = '\u001b[32m',
    reset     = '\u001b[0m';


// Setup
storage.open(function(){
  
  // Register
  bot.register();
  
  // Print Ready
  console.log(blue + "Ready" + reset);
  
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
  console.log(err);
  bot.unregister();
  process.exit(1);
});