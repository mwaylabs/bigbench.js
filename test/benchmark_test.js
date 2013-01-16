var helper    = require('./helper'),
    benchmark = require('../modules/benchmark'),
    config    = require("../config/config");

describe("Benchmark", function(){
  
  var benchmarkString = "\
    {\
      duration: 5,\
      rampUp:   20,\
      actions:[\
        {\
          name: 'Blank Page',\
          hostname: 'localhost',\
          path: '/blank',\
          port: 8888,\
          method: 'GET',\
        },\
        {\
          name: 'Parameter Page',\
          hostname: 'localhost',\
          path: '/params',\
          port: 8888,\
          method: 'GET',\
          params: function(){ return { say: 'hello', to: 'me' }}\
        },\
        {\
          name: 'Post Page',\
          hostname: 'localhost',\
          path: '/upload',\
          port: 8888,\
          method: 'POST',\
          params: function(){ return { say: 'hello', to: 'me' }}\
        }\
      ]\
    }\
  ";
  
  it("stores and loads benchark globally", function(done){
    benchmark.save(benchmarkString, function(){
      benchmark.load(function(aBenchmark){
        aBenchmark.duration.should.eql(5);
        aBenchmark.actions[0].port.should.eql(8888);
        aBenchmark.actions[1].params().should.eql({ say: 'hello', to: 'me' });
        done();
      });
    });
  });
  
  it("starts and stops the benchmark status", function(){
    benchmark.status().should.eql("STOPPED");
    benchmark.start();
    benchmark.status().should.eql("RUNNING");
    benchmark.stop();
    benchmark.status().should.eql("STOPPED");
  });
  
  it("run the benchmark", function(done){
    benchmark.save(benchmarkString, function(){
      benchmark.run(done);
    });
  });
  
  it("validates a GET action without query string", function(){
    var action = {
      name: 'Google Page',
      hostname: 'www.google.de',
      path: '/',
      port: 80,
      method: 'GET'
    };
    var options = {
      hostname: 'www.google.de',
      path: '/?',
      port: 80,
      method: 'GET'
    };
    benchmark.validateAction(action).should.eql(options);
  });
  
  it("validates a GET action with query string", function(){
    var action = {
      name: 'Google Page',
      hostname: 'www.google.de',
      path: '/',
      port: 80,
      method: 'GET',
      params: { q: 'southdesign de' }
    };
    var options = {
      hostname: 'www.google.de',
      path: '/?q=southdesign%20de',
      port: 80,
      method: 'GET'
    };
    benchmark.validateAction(action).should.eql(options);
  });
  
});