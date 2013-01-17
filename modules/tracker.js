var storage  = require("../modules/storage"),
    config   = require("../config/config");

// Adds the tracking for the action and the total counts
exports.track = function(index, status, callback){
  storage.redis.hincrby("bigbench_action_" + index, status, 1, function(){
    storage.redis.hincrby("bigbench_total", status, 1, callback);
  });
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