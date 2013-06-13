// Global Settings
exports.duration    = 120;
exports.concurrency = 1;
exports.delay       = 0;
exports.rampUp      = 20;

// Actions
exports.actions = [
  
  // Plain GET Query
  function(lastResponse, lastAction, state){
    var action = {
      name:     "Google Startpage",
      hostname: "www.google.com",
      path:     "/",
      port:     80,
      method:   "GET"
    };
    return action;
  },
  
  // GET Query with Params (www.google.com?q=southdesign)
  function(lastResponse, lastAction, state){
    var action = {
      name:     "Google Startpage",
      hostname: "www.google.com",
      path:     "/",
      port:     80,
      method:   "GET",
      params:   { "q": "southdesign" }
    };
    return action;
  },
  
  // GET Query with Basic Auth
  function(lastResponse, lastAction, state){
    var action = {
      name:     "Basic Auth Page",
      hostname: "www.website.com",
      path:     "/secret",
      port:     80,
      method:   "GET",
      auth:     "user:password"
    };
    return action;
  },
  
  // POST Request with Content and Headers
  function(lastResponse, lastAction, state){
    var action = {
      name:     "Posting Content",
      hostname: "www.google.com",
      path:     "/signin",
      port:     80,
      method:   "POST",
      params:   { "user": "credentials" },
      headers:  { "content-type": "application/json" }
    };
    return action;
  }
  
];