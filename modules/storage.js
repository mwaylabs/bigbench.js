var config         = require("../config/config"),
    redisdb        = require("redis"),
    redis          = redisdb.createClient(config.redis.port, config.redis.host),
    redisForEvents = redisdb.createClient(config.redis.port, config.redis.host);

// Authenticate at Redis
if(config.redis.password){
  redis.auth(config.redis.password);
  redisForEvents.auth(config.redis.password);
}

// Ensures that all storage connections are made
exports.open = function(callback){
  exports.checkRedis(callback);
}

// Checks redis connection
exports.checkRedis = function(callback){
  
  // Log disconnection, etc.
  redis.on("error",           function(error){ console.log(error); });
  redisForEvents.on("error",  function(error){ console.log(error); });
  
  // Start all on callback
  if(redis.connected){ callback(); }
  redis.on("ready", callback);
}

exports.redis = redis;
exports.redisForEvents = redisForEvents;