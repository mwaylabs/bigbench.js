var storage       = require("../modules/storage"),
    bot           = require("../modules/bot"),
    tracker       = require("../modules/tracker"),
    config        = require("../config/config"),
    crypto        = require('crypto'),
    http          = require('http'),
    querystring   = require("querystring"),
    status        = "STOPPED",
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
  if(stopCallback){ stopCallback(); }
}
exports.status  = function(){ return status; }

// Globally saves a benchark string as a closure
exports.save = function(benchmarkString, callback){
  storage.redis.set("bigbench_benchmark", "(function(){ return " + benchmarkString + "});", callback);
}

// Loads and evaluates a benchmark string as closure from the global store
exports.load = function(callback){
  storage.redis.get("bigbench_benchmark", function(error, benchmarkString){
    if(benchmarkString){ callback(eval(benchmarkString)());
    } else{              callback(false); }
  });
}

// Runs the latest benchmark
exports.run = function(done){
  
  // load
  exports.load(function(benchmark){
    
    // stop
    setTimeout(exports.stop, benchmark.duration * 1000);
    
    // start
    exports.start();
    exports.request(benchmark, 0);
    stopCallback = done;
  });
}

// Cycle through all actions and request it
exports.request = function(benchmark, index){
  if(status !== "RUNNING"){ return; }
  
  var action  = benchmark.actions[index],
      options = exports.validateAction(action),
      request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('end', function () {
          
          // track
          tracker.track(index, response.statusCode);
          
          // next action / request
          index += 1;
          if(index > benchmark.actions.length - 1){ index = 0 };
          exports.request(benchmark, index);
          
        });
      });
  
  
  // send post params in body
  if(action.method === "POST"){ request.write(exports.validateParams(action.params)); }
  
  request.end();
}

// Ensures the action maps the parameters, etc.
exports.validateAction = function(action){
  var options = {};
  if(action.host){      options.host      = action.host; };
  if(action.hostname){  options.hostname  = action.hostname; };
  if(action.path){      options.path      = action.path; };
  if(action.port){      options.port      = action.port; };
  if(action.method){    options.method    = action.method; };
  
  // add query string to path
  if(action.method !== "POST"){ options.path += "?" + exports.validateParams(action.params); }
  
  // set post header
  if(action.method === "POST"){ options.headers = { "Content-type": "application/x-www-form-urlencoded" }; }
  
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