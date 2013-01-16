var config     = require('./config/config'),
    storage    = require('./modules/storage'),
    bot        = require('./modules/bot'),
    id         = bot.id();


// Setup
storage.open(function(){
  
  // Register
  bot.register(id);
  
  // wait for benchmarks to execute
  
  // setup trap with unregister
});


// Trap Exits
process.on('SIGINT', function(){
  bot.unregister(id);
  process.exit(1);
});

process.on('uncaughtException', function(err){
  bot.unregister(id);
  process.exit(1);
});