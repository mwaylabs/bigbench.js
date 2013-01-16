var config        = require("../config/config"),
    header        = require("../modules/header"),
    storage       = require("../modules/storage"),
    tracker       = require('../modules/tracker'),
    pixel         = require('../modules/pixel'),
    allowedStates = ["click", "landed"];


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
      response.end(JSON.stringify({ error: 103, message: "previous state wasn't a click" }));
      return;
    }
    
    // Return 1x1 Tracking Pixel
    response.writeHead(200, {'Content-Type': 'image/png' });
    response.end(pixel, 'utf-8');
    
    // Cache tracking and track
    if(tracking.type !== "landed"){
      tracking = exports.cacheTracking(params.id, tracking);
      tracking = exports.trackLanded(tracking);
    }
  });
};

// Inspects the incoming adrequest for its parameters and checks them for presence only
// It returns an error with the code 100 for a missing parameter or false for no errors
exports.validateParams = function(params){
  
  // Presence
  if(!params.id)          return { error: 100, message: "id parameter is missing" };
  
  return false;
}



// Tracks the actual impression without the impression_url and click_url
exports.trackLanded = function(tracking){
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
  tracking.type = "landed"
  tracker.cache(id, tracking);
  return tracking;
}