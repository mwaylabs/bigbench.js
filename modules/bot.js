var storage  = require("../modules/storage"),
    config   = require("../config/config"),
    crypto   = require('crypto'),
    cachedId = undefined;

// Initially creates a SHA2 based random bot ID that is used for
// identification. This method should be called only once during the
// initialization of the bot
exports.id = function(){
  if(cachedId){ return cachedId; }
  var currentDate  = (new Date()).valueOf().toString(),
      random        = Math.random().toString();
  
  cachedId = crypto.createHash('sha1').update(currentDate + random).digest('hex');
  return cachedId;
}

// Tries to find a registered bot and returns the current status
exports.find = function(id, callback){
  storage.redis.hget("bigbench_bots", id, function(error, status){
    if(status){ callback(status); }
    else{       callback(false);  }
  });
}

// Updates the bot status
exports.status = function(status, callback){
  storage.redis.hset("bigbench_bots", exports.id(), status, callback);
}

// Adds the bot to the registry
exports.register = function(callback){
  exports.status("STOPPED", callback);
}

// Removes the bot from the registry
exports.unregister = function(callback){
  storage.redis.hdel("bigbench_bots", exports.id(), callback);
}