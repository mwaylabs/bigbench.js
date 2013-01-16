var storage = require("../modules/storage");
exports.storage = storage;

// Clear the trackings
exports.clearRedis = function(callback){
  storage.redis.flushall(function(err){ callback(); });
}