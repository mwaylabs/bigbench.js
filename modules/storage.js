var config  = require("../config/config"),
    redisdb = require("redis"),
    redis   = redisdb.createClient(config.redis.port, config.redis.host);

// Authenticate at Redis
if(config.redis.password){ redis.auth(config.redis.password); }

// Ensures that all storage connections are made
exports.open = function(callback){
  exports.checkRedis(function(){
    callback();
  });
}

// Checks redis connection
exports.checkRedis = function(callback){
  if(redis.connected) callback();
  redis.on("ready", function(){ callback(); });
  redis.on("error", function(error){ throw error; });
}

exports.redis = redis;