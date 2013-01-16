var storage = require("../modules/storage"),
    config  = require("../config/config"),
    crypto  = require('crypto');

// Initially creates a SHA2 based random bot ID that is used for
// identification. This method should be called only once during the
// initialization of the bot
exports.id = function(){
  var currentDate  = (new Date()).valueOf().toString(),
      random        = Math.random().toString();
  
  return crypto.createHash('sha1').update(currentDate + random).digest('hex');
}

// Updates the bot status
exports.find = function(id, status, callback){
  storage.redis.hset("bigbench_bots", id, status, callback);
}

// Tries to find a registered bot and returns the current status
exports.find = function(id, callback){
  storage.redis.hget("bigbench_bots", id, function(error, status){
    if(status){ callback(status); }
    else{       callback(false);  }
  });
}

// Updates the bot status
exports.status = function(id, status, callback){
  storage.redis.hset("bigbench_bots", id, status, callback);
}

// Adds the bot to the registry
exports.register = function(id, callback){
  exports.status(id, "STOPPED", callback);
}

// Removes the bot from the registry
exports.unregister = function(id, callback){
  storage.redis.hdel("bigbench_bots", id, callback);
}