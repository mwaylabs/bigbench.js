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
  var keys  = ["bigbench_total"],
      multiGet    = storage.redis.multi(),
      multiStore  = storage.redis.multi();
  
  for (var i = 0; i < benchmark.actions.length; i++) { keys.push("bigbench_action_" + i); };
  for (var index in keys) { multiGet.hgetall(keys[index]); };
  
  // get current values
  multiGet.exec(function(error, replies){
    var current = {};
    for(var index in keys){
      current[keys[index]] = exports.clone(replies[index]);
      for(var status in replies[index]){
        var lastValue = 0;
        try{ lastValue = parseInt(last[index][status]) } catch(e){};
        current[keys[index]][status] = (replies[index][status] - lastValue).toString();
      }
      if(current[keys[index]]){
        multiStore.hmset(keys[index] + "_at_" + time, current[keys[index]]);
        // also publish as stringified JSON with time and all values
      }
    };
    last = replies;
    //console.log(current);
    
    multiStore.exec(function(){
      callback();
    });
  });
  
  // write them, publish them and update them to the old ones
}

// make a real copy of a javascript object
exports.clone = function(obj){
    // Handle the 3 simple types, and null or undefined
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

    throw new Error("Unable to copy obj! Its type isn't supported.");
}