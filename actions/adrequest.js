var config  = require("../config/config"),
    header  = require("../modules/header"),
    storage = require("../modules/storage"),
    finder  = require('../modules/finder'),
    tracker = require('../modules/tracker');


// The actual adrequest
exports.call = function(request, response){
  var params = request.body,
      error  = false;
  
  // Parameters
  if(error = exports.validateParams(params)){
    response.writeHead(400, header.default);
    response.end(JSON.stringify(error));
    return;
  }
  
  // Publisher
  finder.validatePublisher({ api_key: params.api_key }, function(publisher){
    if(!publisher){
      response.writeHead(400, header.default);
      response.end(JSON.stringify({ error: 101, message: "api_key not found" }));
      return;
    }
    
    // Campaign & Radius
    finder.resolveMaxDistance(params.campaign_id, function(campaign){
      if(!campaign){
        response.writeHead(400, header.default);
        response.end(JSON.stringify({ error: 101, message: "campaign_id not found" }));
        return;
      }
      
      // Search Params
      var findParams = {
        publisher_id: publisher._id, 
        campaign_id:  campaign._id,
        bannersize:   params.bannersize,
        position:     { latitude: Number(params.latitude), longitude: Number(params.longitude) },
        radius:       campaign.radius
      };
      
      // Track adrequest before the search has started
      var tracking = exports.trackAdrequest(findParams);
      
      // Banner
      finder.findNearestLocation(findParams, function(location){
        if(!location){
          response.writeHead(200, header.default);
          response.end(JSON.stringify({ type: "noad", message: "no ad for this position" }));
          return;
        }
        
        var id    = tracker.createId(),
            json  = {
              location_id:        location._id,
              distance_in_meters: location.distance,
              impression_url:     config.host + "/impression/" + id + ".png",
              click_url:          config.host + "/click/"      + id
            };
        
        response.writeHead(200, header.default);
        response.end(JSON.stringify(json));
        
        // Track successfull adresponse and cache it under the id for the next states
        tracking = exports.trackAdresponse(tracking, location);
        tracking = exports.cacheTracking(id, tracking, location, findParams);
        return;
      });
      
    });
    
  });
};

// Inspects the incoming adrequest for its parameters and checks them for presence only
// It returns an error with the code 100 for a missing parameter or false for no errors
exports.validateParams = function(params){
  
  // Presence
  if(!params.api_key)     return { error: 100, message: "api_key parameter is missing" };
  if(!params.campaign_id) return { error: 100, message: "campaign_id parameter is missing" };
  if(!params.bannersize)  return { error: 100, message: "bannersize parameter is missing" };
  if(!params.latitude)    return { error: 100, message: "latitude parameter is missing" };
  if(!params.longitude)   return { error: 100, message: "longitude parameter is missing" };
  
  // Validity
  if(params.latitude  < -90  || params.latitude > 90)   return { error: 101, message: "latitude must be between -90 and +90" };
  if(params.longitude < -180 || params.longitude > 180) return { error: 101, message: "longitude must be between -180 and +180" };
  
  return false;
}

// Tracks the actual adrequest before the banner search has even started
exports.trackAdrequest = function(params){
  var tracking = {
    type:         "adrequest",
    created_at:   new Date().toISOString(),
    publisher_id: params.publisher_id,
    campaign_id:  params.campaign_id,
    bannersize:   params.bannersize,
    latitude:     params.position.latitude,
    longitude:    params.position.longitude
  };
  
  tracker.track(tracking);
  return tracking;
}

// Tracks the returned banner if the search was successfull
exports.trackAdresponse = function(tracking, location){
  tracking.type         = "adresponse"
  tracking.location_id  = location._id
  
  tracker.track(tracking);
  return tracking;
}

// Caches the tracking with the distance in meters
exports.cacheTracking = function(id, tracking, location, request){
  tracking.distance = location.distance;
  tracking.location_latitude   = location.location[0];
  tracking.location_longitude  = location.location[1];
  tracking.request_latitude    = request.position.latitude;
  tracking.request_longitude   = request.position.longitude;
  
  tracker.cache(id, tracking);
  return tracking;
}