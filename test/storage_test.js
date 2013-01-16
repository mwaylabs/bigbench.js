var helper  = require('./helper');

describe("Storage", function(){
  
  it("writes and reads an object from redis", function(done){
    var aDocument = { _id: 1, test: 'test'};
    
    helper.storage.redis.set("test", JSON.stringify(aDocument), function(){
      helper.storage.redis.get("test", function(error, json){
        JSON.parse(json).should.eql(aDocument);
        done();
      });
    });
    
  });
  
});

