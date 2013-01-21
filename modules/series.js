var storage       = require("../modules/storage"),
    benchmark     = require("../modules/benchmark"),
    time          = 0,
    timer         = null,
    last          = {};

// Sets up the series capturing every second
exports.start = function(benchmark){
  time = 0;
  timer = setInterval(function(){
    exports.capture(benchmark, time, function(){ time++; });
  }, 1000);
}

// Stops the series capturing
exports.stop = function(){
  clearInterval(timer);
  time = 0; timer = null;
}

// Captures a current value
exports.capture = function(benchmark, time, callback){
  var keys        = exports.captureKeys(benchmark),
      multiGet    = storage.redis.multi(),
      multiStore  = storage.redis.multi();
  
  // Multi-Get All keys
  for (var index in keys) { multiGet.hgetall(keys[index]); };
  multiGet.exec(function(error, replies){
    var current = {};
    
    // Traverse Keys - bigbench_total, bigbench_action_0, ..
    for(var index in keys){
      var name        = keys[index],
          isDuration  = (name.indexOf("_duration") !== -1);
      
      // Clone Reply for Save Manipulation
      current[name] = exports.clone(replies[index]);
      
      // Traverse Status - 200: 34, 404: 3, 500: 1
      for(var status in replies[index]){
        var lastValue = 0;
        try{ lastValue = last[index][status]; } catch(e){};
        current[name][status] = replies[index][status] - lastValue;
        
        // Calculate Average Duration - 600 ms / 1054 R/s
        if(isDuration){
          var lastDivider = 0,
              nameDivider = name.replace("_duration", "");
          try{ lastDivider = current[nameDivider][status]; } catch(e){};
          current[name][status] = exports.roundNumber(current[name][status] / lastDivider) || 0;
        }
      }
      
      // Append & Publish Results to Redis
      var jsonSnapshot = JSON.stringify(current[name]);
      multiStore.rpush(name + "_series", jsonSnapshot);
      multiStore.publish(name + "_series", jsonSnapshot);
    };
    multiStore.exec(callback);
    last = replies;
  });
}

// Returns an array of all keys that are needed for a capture
exports.captureKeys = function(benchmark){
  var keys  = ["bigbench_total", "bigbench_total_duration"];
  for (var i = 0; i < benchmark.actions.length; i++) {
    keys.push("bigbench_action_" + i);
    keys.push("bigbench_action_" + i + "_duration");
  };
  return keys;
}

// make a real copy of a javascript object
exports.clone = function(obj){
  if (null == obj || "object" != typeof obj) return obj;
  
  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = exports.clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = exports.clone(obj[attr]);
    }
    return copy;
  }
  
  throw new Error("Couldn't clone the object");
}

// Rounds the numbers with precision of two
exports.roundNumber = function(number){
  var rounded = Math.round(number * Math.pow(10,2)) / Math.pow(10,2);
  return rounded;
}