// Global Settings
exports.duration    = 2;
exports.concurrency = 1;
exports.delay       = 0;
exports.rampUp      = 0;
exports.proxyUrl    = "localhost";
exports.proxyPort   = 9000;

// Actions
exports.actions = [

  function(lastResponse, lastAction, state){
    var action = {
      "name":     "Blank Page",
      "hostname": "localhost",
      "path":     "/blank",
      "port":     8888,
      "method":   "GET"
    };
    return action;
  },
  
  function(lastResponse, lastAction, state){
    var action = {
      "name":     "Post Page",
      "hostname": "localhost",
      "path":     "/upload",
      "port":     8888,
      "method":   "POST",
      "params":   { say: 'hello', to: 'me' }
    };
    return action;
  },
  
  // GET Query with Basic Auth
  function(lastResponse, lastAction, state){
    var action = {
      "name":     "Headers Page",
      "hostname": "localhost",
      "path":     "/types",
      "port":     8888,
      "method":   "GET",
      "headers":  { "Content-Type": "application/json" }
    };
    return action;
  }
];