var storage           = require("../modules/storage"),
    benchmark         = require("../modules/benchmark"),
    config            = require("../config/config"),
    color             = require('../modules/color'),
    logger            = require('../modules/logger'),
    crypto            = require('crypto'),
    status            = "READY",
    heartbeat         = null,
    heartbeatRate     = 60000, // every minute
    heartbeatCount    = 0,
    cachedId          = undefined;

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

// Returns all available bot ids
exports.all = function(callback){
  storage.redis.hkeys("bigbench_bots", function(error, keys){
    if(keys){ callback(keys);   }
    else{     callback(false);  }
  });
}

// Updates the bot status
exports.status = function(aStatus, callback){
  status = aStatus;
  storage.redis.hset("bigbench_bots", exports.id(), aStatus, callback);
  storage.redis.publish("bigbench_bots_status", exports.id() + ":" + aStatus);
}

// Updates the bot status
exports.heartbeat = function(){
  heartbeat = setInterval(function(){
    heartbeatCount++;
    storage.redis.hset("bigbench_bots", exports.id(), status);
    logger.print("Bot " + exports.id(), "Heartbeat #" + heartbeatCount + " - Uptime " + logger.numberFormat(heartbeatCount / ((heartbeatRate/1000) * 24)) + " Days", color.green);
  }, heartbeatRate);
}

// Adds the bot to the registry
exports.register = function(callback){
  storage.redis.publish("bigbench_bots_status", exports.id() + ":READY");
  exports.status("STOPPED", function(){
    exports.heartbeat();
    if(callback) callback();
  });
}

// Removes the bot from the registry
exports.unregister = function(callback){
  status = "KILLED";
  clearInterval(heartbeat);
  storage.redis.hdel("bigbench_bots", exports.id(), callback);
  storage.redis.publish("bigbench_bots_status", exports.id() + ":KILLED");
}