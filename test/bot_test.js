var helper  = require('./helper'),
    bot     = require('../modules/bot'),
    config  = require("../config/config");

describe("Bot", function(){
  
  it("calculates a random bot id", function(){
    bot.id().should.be.a("string");
  });
  
  it("registers the bot", function(done){
    var id = bot.id();
    bot.register(function(){
      bot.find(id, function(status){
        if(status === "STOPPED"){ done(); }
        else{ throw { message: "Bot not registered!" }}
      })
    });
  });
  
  it("unregisters the bot", function(done){
    var id = bot.id();
    bot.register(function(){
      bot.unregister(function(){
        bot.find(id, function(status){
          if(!status){ done(); }
          else{ throw { message: "Bot not unregistered!" }}
        })
      });
    });
  });
  
  it("updates the status of bot", function(done){
    var id = bot.id();
    bot.register(function(){
      bot.find(id, function(status){
        if(status === "STOPPED"){
          bot.status("RUNNING", function(){
            bot.find(id, function(status){
              if(status === "RUNNING"){ done(); }
            });
          });
        }
      });
    });
  });
  
});