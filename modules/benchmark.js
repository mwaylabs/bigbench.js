var storage       = require("../modules/storage"),
    bot           = require("../modules/bot"),
    events        = require("../modules/events"),
    series        = require("../modules/series"),
    tracker       = require("../modules/tracker"),
    config        = require("../config/config"),
    color         = require('../modules/color'),
    logger        = require('../modules/logger'),
    crypto        = require('crypto'),
    http          = require('http'),
    fs            = require('fs'),
    util          = require('util'),
    querystring   = require("querystring"),
    status        = "STOPPED",
    exiting       = false,
    stopTimeout   = null,
    stopCallback  = null;

// Global running state
exports.start   = function(){
  status = "RUNNING";
  bot.status(status);
  stopCallback = null;
}
exports.stop    = function(){
  status = "STOPPED";
  bot.status(status);
  if(stopTimeout){  clearTimeout(stopTimeout); }
  if(stopCallback){ stopCallback(); }
}
exports.status  = function(){ return status; }
exports.exiting = function(yesOrNo){
  if(yesOrNo) exiting = yesOrNo;
  return exiting;
}

// Flushes the redis and globally saves a benchark as JSON
exports.save = function(benchmarkJSON, callback){
  exports.resetData(function(){
    storage.redis.set("bigbench_benchmark", benchmarkJSON, function(){
      storage.redis.publish("bigbench_benchmark_saved", benchmarkJSON);
      logger.print("Benchmark", "Saved", color.green);
      callback();
    });
  });
}

// Loads and evaluates a benchmark string as closure from the global store
exports.load = function(callback){
  storage.redis.get("bigbench_benchmark", function(error, benchmarkJSON){
    if(benchmarkJSON){ callback(exports.parseAndEvaluateFromJSON(benchmarkJSON));
    } else{            callback(false); }
  });
}

// Parses the JSON and evaluates the params from string or object to function or object
exports.parseAndEvaluateFromJSON = function(json){
  var benchmarkObject = JSON.parse(json);
  for (var i = 0; i < benchmarkObject.actions.length; i++) {
    if(typeof benchmarkObject.actions[i].params === "string"){
      benchmarkObject.actions[i].params = eval("(" + benchmarkObject.actions[i].params + ")");
    }
  };
  return benchmarkObject;
}

// Resets the collected data but leaves the bots and benchmark intact
exports.resetData = function(callback){
  var keys = [
    "bigbench_total",
    "bigbench_total_duration", 
    "bigbench_timing", 
    "bigbench_total_series", 
    "bigbench_total_duration_series",
    "bigbench_statistics"
  ];
  for (var i = 0; i < 50; i++) {
    keys.push("bigbench_action_" + i);
    keys.push("bigbench_action_" + i + "_duration");
    keys.push("bigbench_action_" + i + "_series");
    keys.push("bigbench_action_" + i + "_duration_series");
  };
  storage.redis.del(keys, callback);
}

// Runs the latest benchmark - used in bot
exports.run = function(done){
  if(status !== "STOPPED"){ return; }
  
  // load
  exports.load(function(benchmark){
  
    // options
    benchmark.duration    = benchmark.duration    || 60;
    benchmark.delay       = benchmark.delay       || 0;
    benchmark.concurrency = benchmark.concurrency || 1;
    if(!benchmark.actions || benchmark.actions.length <= 0) throw "Please add at least one action...";
  
    // stop
    stopTimeout = setTimeout(exports.stop, benchmark.duration * 1000);
  
    // start concurrent
    exports.start();
    for (var i = 0; i < benchmark.concurrency; i++) {
      var agent = new http.Agent({ maxSockets: 1 });
      exports.request(benchmark, 0, agent);
    };
    
    stopCallback = done;
  });
}

// Cycle through all actions and request it
exports.request = function(benchmark, index, agent){
  if(status !== "RUNNING"){ return; }
  
  var action   = benchmark.actions[index],
      options  = exports.validateAction(action, agent),
      options  = exports.validateProxy(options, benchmark, action),
      duration = 0,
      started  = new Date().getTime(),
      request  = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('end', function () {
          
          // duration
          duration = new Date().getTime() - started;
          
          // track
          tracker.track(index, response.statusCode, duration);
          
          // next action / request
          index += 1;
          if(index > benchmark.actions.length - 1){ index = 0 };
          
          // call with or without delay
          if(benchmark.delay <= 0){ exports.request(benchmark, index, agent); }
          else{ setTimeout(function(){exports.request(benchmark, index, agent); }, benchmark.delay); }
        });
        response.resume();
      });
  
  
  // send post params in body
  if(action.method === "POST"){ request.write(exports.validateParams(action.params)); }
  
  request.end();
}

// Ensures the action maps the parameters, etc.
exports.validateAction = function(action, agent){
  var options = { agent: agent, headers: exports.validateHeaders(action) };
  if(action.host){      options.host      = action.host; };
  if(action.hostname){  options.hostname  = action.hostname; };
  if(action.path){      options.path      = action.path; };
  if(action.port){      options.port      = action.port; };
  if(action.method){    options.method    = action.method; };
  if(action.auth){      options.auth      = action.auth; };
  
  // add query string to path
  if(action.method !== "POST"){
    var queryString = exports.validateParams(action.params);
    if(queryString !== ""){ options.path += "?" + queryString }
  }
  
  return options;
}

// Converts the headers keys to lower cases and adds a form if POST and not overridden
exports.validateHeaders = function(action){
  var headers    = action.headers || {},
      newHeaders = {};
  
  // default post header
  if(action.method === "POST"){ newHeaders = { "content-type": "application/x-www-form-urlencoded" }; }
  
  // lowercase all keys
  Object.keys(headers).forEach(function(key){
    newHeaders[key.toLowerCase()] = headers[key];
  });
  
  return newHeaders;
}

// Checks if a global proxy is set and applies it to the request
exports.validateProxy = function(options, benchmark, action){
  if(benchmark.proxyUrl && benchmark.proxyPort){
    
    // add host to headers
    options.headers.host = options.headers.host || action.hostname + ":" + action.port;
    
    // modify paths to allow node to perform proxy request
    options.path     = "http://" + options.hostname + ":" + options.port + options.path;
    options.hostname = benchmark.proxyUrl;
    options.port     = benchmark.proxyPort;
    
  }
  return options;
}

// Checks weather params is an object or function and converts it to an object
exports.validateParams = function(params){
  if(!params || params === ""){ return ""; }
  return querystring.stringify(exports.toObject(params));
}

// Checks if the supplied object is a function
exports.isFunction = function(obj){
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

// Checks if the supplied object is a function
exports.toObject = function(objectOrFunction){
  return exports.isFunction(objectOrFunction) ? objectOrFunction() : objectOrFunction;
}

// Copies the benchmark template to the current directory for the new command
exports.createBenchmarkFromTemplate = function(callback){
  var template  = fs.createReadStream(__dirname + '/../templates/benchmark.json'),
      template2 = fs.createReadStream(__dirname + '/../templates/config.js'),
      copy      = fs.createWriteStream('benchmark.json'),
      copy2     = fs.createWriteStream('config.js');
  
  template.on('close', function(){
    console.log(color.green + "Created benchmark.json" + color.reset);
  })
  
  template2.on('close', function(){
    console.log(color.green + "Created config.js" + color.reset);
    callback();
  });
  
  template.pipe(copy);
  template2.pipe(copy2);
}

// Checks if the supplied argument is a file or a string. If it is a file it
// is read and then saved to the benchmark
exports.saveBenchmarkFromArgument = function(callback){
  if(!process.argv[3]){ throw "Please supply a benchmark file..."};
  var benchmarkString = fs.readFileSync(process.argv[3]);
  
  // throws an error if benchmark is invalid
  eval(benchmarkString);
  
  // save
  exports.save(benchmarkString, callback);
}

// Sets up and runs a full benchmark with ramp up, etc.
exports.setupAndStart = function(callback){
  exports.resetData(function(){
    exports.load(function(benchmark){
      exports.setupTiming(benchmark, function(ramp, timing){
        storage.redis.set("bigbench_status", "RUNNING");
        storage.redis.publish("bigbench_status", "RUNNING");
        exports.startRamp(ramp);
        series.start(benchmark);
        exports.registerStop(benchmark, callback);
      });
    });
  });
}

// Sets up the timestamps for start, stop and ramp up
exports.setupTiming = function(benchmark, callback){
  var start  = new Date().getTime(),
      ramp   = false,
      timing = {
        "START": start.toString(),
        "STOP" : (start + (benchmark.duration * 1000)).toString()
      };
  
  // Save Timing with or without Ramp
  bot.all(function(bots){
    if(bots.length <= 0) throw "Please start a bot first..."
    if(benchmark.rampUp){
      ramp = {};
      var timer = 0,
          delta = (benchmark.rampUp / bots.length) * 1000;
      for(var id in bots){
        ramp[bots[id]]    = timer;
        timing[bots[id]]  = (start + timer).toString();
        timer += delta;
      }
      storage.redis.hmset("bigbench_timing", timing, function(){ callback(ramp, timing); });
      storage.redis.publish("bigbench_timing", JSON.stringify(timing));
    } else{
      storage.redis.hmset("bigbench_timing", timing, function(){ callback(ramp, timing); });
      storage.redis.publish("bigbench_timing", JSON.stringify(timing));
    }
  });
}

// If no ramp is returned, all bots are started at the same time.
exports.startRamp = function(ramp){
  if(!ramp){ events.start("ALL"); }
  else{
    for(var id in ramp){
      // start instance X after X ms
      (function(theId, theRamp){
        setTimeout(function(){ events.start(theId); }, theRamp[id]);
      })(id, ramp);
    }
  }
}

// Stop after benchmark duration
exports.registerStop = function(benchmark, callback){
  setTimeout(function(){ exports.teardownAndStop(callback); }, benchmark.duration * 1000);
}

// Shuts down a benchmark from the controlling side / not the bot side
exports.teardownAndStop = function(callback, error){
  exiting = true;
  events.stop("ALL");
  series.stop();
  logger.print("Benchmark", "Done", color.green);
  storage.redis.del("bigbench_status");
  storage.redis.del("bigbench_timing");
  storage.redis.publish("bigbench_status", "STOPPED");
  if(!error){ series.statistics(callback); }
  else{ callback(); }
}