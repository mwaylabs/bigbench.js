var config    = require('./config/config'),
    storage   = require('./modules/storage'),
    events    = require('./modules/events'),
    benchmark = require('./modules/benchmark'),
    bot       = require('./modules/bot');


// Setup
storage.open(function(){
  
  // Register
  bot.register();
  
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
  bot.unregister();
  process.exit(1);
});