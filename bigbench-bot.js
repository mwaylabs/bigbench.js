var config     = require('./config/config'),
    storage    = require('./modules/storage'),
    bot        = require('./modules/bot');


// Setup
storage.open(function(){
  
  // Register
  bot.register();
  
  // wait for benchmarks to execute
  
  // setup trap with unregister
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