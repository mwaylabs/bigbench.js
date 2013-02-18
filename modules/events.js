var storage  = require("../modules/storage"),
    bot      = require("../modules/bot"),
    config   = require("../config/config"),
    color    = require('../modules/color'),
    logger   = require('../modules/logger');

// Waits for a start event
exports.waitForStart = function(start, subscribed){
  exports.waitForX("start", start, subscribed);
}

// Waits for a start event
exports.waitForStop = function(stop, subscribed){
  exports.waitForX("stop", stop, subscribed);
}

// Waits for X event and setups the callbacks
exports.waitForX = function(action, callback, subscribed){
  var actionChannel = "bigbench_bots_" + action;
  
  // Run callback on message receival
  storage.redisForEvents.on("message", function (channel, botID) {
    if(channel === actionChannel){
      if(botID === "ALL" || botID === bot.id()){ callback(botID); }
    }
  });
  
  // Wait for subscription if subscription callback is given - usually for test only
  storage.redisForEvents.on("subscribe", function (channel, count) {
    if(subscribed && channel === actionChannel){ subscribed(); }
  });
  
  // subscribe to the action channel
  storage.redisForEvents.subscribe(actionChannel);
}

// Sends a start event for a bot id or ALL bots
exports.start = function(botID, callback){
  storage.redis.publish("bigbench_bots_start", botID, callback);
  logger.print("Bots", "Started " + botID, color.green);
}

// Sends a start event for a bot id or ALL bots
exports.stop = function(botID, callback){
  storage.redis.publish("bigbench_bots_stop", botID, callback);
  logger.print("Bots", "Stopped ALL", color.green);
}