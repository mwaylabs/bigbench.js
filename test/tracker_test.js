var helper  = require('./helper'),
    tracker = require('../modules/tracker'),
    config  = require("../config/config");

describe("Tracker", function(){
  
  // clear redis before every test
  beforeEach(function(done){ helper.clearRedis(done); });
  
  it("tracks the status code for the action", function(done){
    var index = 0,
        status = 200;
    tracker.track(index, status, function(){
      tracker.findForAction(index, function(trackings){
        trackings[status].should.eql("1");
        tracker.find(function(trackings){
          trackings[status].should.eql("1");
          done();
        });
      });
    });
  });
  
});