var helper  = require('./helper'),
    events  = require('../modules/events'),
    config  = require("../config/config");

describe("Events", function(){
  
  it("waits for a start", function(done){
    events.waitForStart(function(botID){
      botID.should.eql("ALL");
      done();
    }, function(){ events.start("ALL"); });
  });
  
  it("waits for a stop", function(done){
    events.waitForStop(function(botID){
      botID.should.eql("ALL");
      done();
    }, function(){ events.stop("ALL"); });
  });
  
});