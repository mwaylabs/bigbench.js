var helper    = require('./helper'),
    benchmark = require('../modules/benchmark'),
    tracker   = require('../modules/tracker'),
    config    = require("../config/config");

describe("Benchmark", function(){
  
  var benchmarkString = "\
    {\
      duration: 2,\
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
        aBenchmark.duration.should.eql(2);
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
      benchmark.run(function(){
        tracker.findForAction(0, function(trackings){
          parseInt(trackings[200]).should.be.above(50);
          tracker.findForAction(1, function(trackings){
            parseInt(trackings[200]).should.be.above(50);
            tracker.findForAction(2, function(trackings){
              parseInt(trackings[200]).should.be.above(50);
              tracker.find(function(trackings){
                parseInt(trackings[200]).should.be.above(150);
                done();
              });
            });
          });
        });
      });
    });
  });
  
  it("validates a GET action without query string", function(){
    var action = {
      name: 'Google Page',
      hostname: 'www.google.de',
      path: '/',
      port: 80,
      method: 'GET'
    },
    validatedOptions = benchmark.validateAction(action);
    validatedOptions.hostname.should.eql("www.google.de");
    validatedOptions.path.should.eql("/?");
    validatedOptions.port.should.eql(80);
    validatedOptions.method.should.eql("GET");
  });
  
  it("validates a GET action with query string", function(){
    var action = {
      name: 'Google Page',
      hostname: 'www.google.de',
      path: '/',
      port: 80,
      method: 'GET',
      params: { q: 'southdesign de' }
    },
    validatedOptions = benchmark.validateAction(action);
    validatedOptions.hostname.should.eql("www.google.de");
    validatedOptions.path.should.eql("/?q=southdesign%20de");
    validatedOptions.port.should.eql(80);
    validatedOptions.method.should.eql("GET");
  });
  
});