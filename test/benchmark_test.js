var helper    = require('./helper'),
    benchmark = require('../modules/benchmark'),
    tracker   = require('../modules/tracker'),
    storage   = require('../modules/storage'),
    events    = require('../modules/events'),
    config    = require("../config/config");

describe("Benchmark", function(){
  
  // clear redis before every test
  beforeEach(function(done){ helper.clearRedis(done); });
  
  var benchmarkJSON = '\
    {\
      "duration": 2,\
      "rampUp":   20,\
      "actions":[\
        {\
          "name": "Blank Page",\
          "hostname": "localhost",\
          "path": "/blank",\
          "port": 8888,\
          "method": "GET"\
        },\
        {\
          "name": "Parameter Page",\
          "hostname": "localhost",\
          "path": "/params",\
          "port": 8888,\
          "method": "GET",\
          "params": "function(){ return { say: \'hello\', to: \'me\' }}"\
        },\
        {\
          "name": "Post Page",\
          "hostname": "localhost",\
          "path": "/upload",\
          "port": 8888,\
          "method": "POST",\
          "params": "function(){ return { say: \'hello\', to: \'me\' }}"\
        }\
      ]\
    }\
  ';
  
  it("stores and loads benchark globally", function(done){
    benchmark.save(benchmarkJSON, function(){
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
    benchmark.save(benchmarkJSON, function(){
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
  
  it("timing without ramp up", function(done){
    var benchmarkNoRamp = {
      duration: 60,
      rampUp:   0,
      actions:[
        {
          name: 'Blank Page',
          hostname: 'localhost',
          path: '/blank',
          port: 8888,
          method: 'GET',
        }
      ]
    };
    
    storage.redis.hset("bigbench_bots", "aaa", "STOPPED", function(){
      benchmark.setupTiming(benchmarkNoRamp, function(ramp){
        ramp.should.eql(false);
        storage.redis.hgetall("bigbench_timing", function(error, timing){
          parseInt(timing["START"]).should.be.below(new Date().getTime() + 1);
          parseInt(timing["STOP"]).should.be.above(new Date().getTime());
          done();
        });
      });
    });
  });
  
  it("timing with ramp up", function(done){
    var benchmarkRamp = {
      duration: 60,
      rampUp:   30,
      actions:[
        {
          name: 'Blank Page',
          hostname: 'localhost',
          path: '/blank',
          port: 8888,
          method: 'GET',
        }
      ]
    };
    
    storage.redis.multi()
      .hset("bigbench_bots", "aaa", "STOPPED")
      .hset("bigbench_bots", "bbb", "STOPPED")
      .hset("bigbench_bots", "ccc", "STOPPED")
      .exec(function(){
        benchmark.setupTiming(benchmarkRamp, function(ramp){
          ramp["aaa"].should.eql(0);
          ramp["bbb"].should.eql(10000);
          ramp["ccc"].should.eql(20000);
          
          storage.redis.hgetall("bigbench_timing", function(error, timing){
            var start = parseInt(timing["START"]);
            parseInt(timing["START"]).should.be.below(new Date().getTime() + 1);
            parseInt(timing["aaa"]).should.eql(start);
            parseInt(timing["bbb"]).should.eql(start + 10000);
            parseInt(timing["ccc"]).should.eql(start + 20000);
            parseInt(timing["STOP"]).should.eql(start + 60000);
            done();
          });
        });
      });
  });
  
});