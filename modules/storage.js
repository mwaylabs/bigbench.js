var config         = require("../config/config"),
    redisdb        = require("redis"),
    color          = require('../modules/color'),
    redis          = redisdb.createClient(config.redis.port, config.redis.host),
    redisForEvents = redisdb.createClient(config.redis.port, config.redis.host);

// Authenticate at Redis
if(config.redis.password){
  redis.auth(config.redis.password);
  redisForEvents.auth(config.redis.password);
}

// Ensures that all storage connections are made
exports.open = function(callback){
  
  // Log disconnection, etc.
  redis.on("error",           function(error){ console.log(color.red + error + color.reset); });
  redisForEvents.on("error",  function(error){ console.log(color.red + error + color.reset); });
  
  // Callback
  callback();
}

exports.redis = redis;
exports.redisForEvents = redisForEvents;