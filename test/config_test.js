var helper = require('./helper'),
    config = require("../config/config");

describe("Config", function(){
  
  // If this test is failing call the tests with NODE_ENV=test mocha
  it("loads the test config", function(){
    config.name.should.eql("test");
  });
  
});