var config        = require("../config/config"),
    header        = require("../modules/header"),
    storage       = require("../modules/storage"),
    tracker       = require('../modules/tracker'),
    url           = require("../modules/url"),
    allowedStates = ["impression", "click"];


// The actual adrequest
exports.call = function(request, response){
  var params = request.params,
      error  = false;
  
  // Parameters
  if(error = exports.validateParams(params)){
    response.writeHead(400, header.default);
    response.end(JSON.stringify(error));
    return;
  }
  
  // Tracking
  tracker.find(params.id, function(tracking){
    if(!tracking){
      response.writeHead(400, header.default);
      response.end(JSON.stringify({ error: 102, message: "id was not found" }));
      return;
    }
    
    // Previous or Current State Check
    if(allowedStates.indexOf(tracking.type) === -1){
      response.writeHead(400, header.default);
      response.end(JSON.stringify({ error: 103, message: "previous state wasn't an impression" }));
      return;
    }
    
    // Redirect to click_url
    var landingPage = url.landing(tracking, params.id);
    response.writeHead(302, {'Content-Type': 'application/json', 'Location': landingPage });
    response.end(JSON.stringify({ message: "successfully tracked click, redirecting to landingpage", url: landingPage }));
    
    // Cache tracking and track
    if(tracking.type !== "click"){
      tracking = exports.cacheTracking(params.id, tracking);
      tracking = exports.trackClick(tracking);
    }
  });
};

// Checks the incoming click for a present id
exports.validateParams = function(params){
  if(!params.id) return { error: 100, message: "id parameter is missing" };
  
  return false;
}

// Tracks the actual click without the impression_url and click_url
exports.trackClick = function(tracking){
  delete tracking.distance
  delete tracking.location_latitude
  delete tracking.location_longitude
  delete tracking.request_latitude
  delete tracking.request_longitude
  
  tracker.track(tracking);
  return tracking;
}

// Updates the cached tracking for the next states with a new "impression" state
exports.cacheTracking = function(id, tracking){
  tracking.type = "click"
  tracker.cache(id, tracking);
  return tracking;
}