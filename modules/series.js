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
      current[name] = exports.clone(replies[index]) || {};
      
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
        
        // delete status if it's zero
        if(current[name][status] === 0) delete current[name][status];
      }
      
      // Add Timing Information
      current[name]["SECOND"] = time
      
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

// Calculates the default statistics after a run
exports.statistics = function(callback){
  var multi       = storage.redis.multi(),
      data        = [{ name: "TOTAL", identifier: "total" }],
      statistics  = {};
  
  // Load Actions
  benchmark.load(function(benchmark){
    for(var index in benchmark.actions){ data.push({ name: "ACTION_" + index, identifier: "action_" + index }); }
    for(var index in data){
      multi.lrange("bigbench_" + data[index].identifier + "_series", 0, -1);
      multi.lrange("bigbench_" + data[index].identifier + "_duration_series", 0, -1);
    }
    
    // Run for Total and all Actions
    multi.exec(function(error, results){
      for(var index in data){
        var resultIndex = 2 * index,
            requests    = exports.statusArray(results[resultIndex]),
            durations   = exports.statusArray(results[resultIndex + 1]);
        
        statistics[data[index].name] = {
          "REQUESTS_PER_SECOND"  : exports.calculateStatistics(requests, false),
          "DURATIONS_PER_SECOND" : exports.calculateStatistics(durations, true)
        };
      }
      
      // Publish and Save Statistics JSON
      var statisticsJSON = JSON.stringify(statistics, undefined, 4);
      storage.redis.set("bigbench_statistics", statisticsJSON);
      storage.redis.publish("bigbench_statistics", statisticsJSON);
      callback(statistics);
    });
  });
}

// Parses the time series and converts it into an object with statuses and an array
exports.statusArray = function(captures){
  var statusArray = {};
  for (var i = 0; i < captures.length; i++) {
    var capture = JSON.parse(captures[i]);
    for(var status in capture){
      if(!statusArray[status]) statusArray[status] = [];
      statusArray[status].push(parseFloat(capture[status]));
    }
    // add a 0 if no requests were made in this second
    for(var storedStatus in statusArray){
      if(!statusArray[storedStatus][i]) statusArray[storedStatus].push(0);
    }
  };
  for(status in statusArray){
    if(!statusArray[status][0]) statusArray[status][0] = 0;
  }
  return statusArray;
};

// Calculates Min Max and Average for a status array
exports.calculateStatistics = function(statusArray, ignoreZeros){
  var calculation = {};
  for(var status in statusArray){
    if(status === "SECOND"){ continue; } 
    var array = ignoreZeros ? exports.arrayWithoutZeros(statusArray[status]) : statusArray[status];
    calculation[status] = {
      AVG: exports.roundNumber(exports.avg(array)),
      MAX: exports.roundNumber(exports.max(array)),
      MIN: exports.roundNumber(exports.min(array)),
      ALL: statusArray[status]
    };
  }
  return calculation;
}

// Calculates the max of an array
exports.max = function(array){
  return Math.max.apply(Math, array);
}

// Calculates the min of an array
exports.min = function(array){
  return Math.min.apply(Math, array);
}

// Calculates the average of an array
exports.avg = function(array){
  return eval(array.join('+')) / array.length;
}

// Removes all zeros from the array and returns a new instance
exports.arrayWithoutZeros = function(array){
  var newArray = [];
  for (var i=0; i < array.length; i++) {
    if(array[i] > 0) newArray.push(array[i]);
  };
  return newArray;
}

