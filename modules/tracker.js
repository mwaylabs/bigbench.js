var storage  = require("../modules/storage"),
    config   = require("../config/config");

// Adds the tracking for the action and the total counts
exports.track = function(index, status, duration, callback){
  storage.redis.multi()
    .hincrby("bigbench_action_" + index, status, 1)
    .hincrby("bigbench_total", status, 1)
    .hincrby("bigbench_action_" + index + "_duration", status, duration)
    .hincrby("bigbench_total_duration", status, duration)
    .hincrby("bigbench_action_" + index, "ALL", 1)
    .hincrby("bigbench_total", "ALL", 1)
    .hincrby("bigbench_action_" + index + "_duration", "ALL", duration)
    .hincrby("bigbench_total_duration", "ALL", duration)
    .exec(callback);
}

// Tries to find all trackings for an action
exports.findForAction = function(index, callback){
  storage.redis.hgetall("bigbench_action_" + index, function(error, trackings){
    if(trackings){  callback(trackings); }
    else{           callback(false);  }
  });
}

// Tries to find all trackings for an action
exports.find = function(callback){
  storage.redis.hgetall("bigbench_total", function(error, trackings){
    if(trackings){  callback(trackings); }
    else{           callback(false);  }
  });
}