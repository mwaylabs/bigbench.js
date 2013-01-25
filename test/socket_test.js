var socket  = require('../bin/bigbench-socket'),
    bot     = require('../modules/bot'),
    io      = require('socket.io-client'),
    config  = require("../config/config"),
    url     = "http://localhost:" + config.websocket.port,
    options = {
      transports: ['websocket'],
      'force new connection': true
    };

describe("Socket",function(){
  it('receives a bot ready status', function(done){
    var client = io.connect(url, options),
        id     = bot.id();
    
    client.on("bigbench_bots_status", function(data){
      var results = data.split(":");
      results[0].should.be.eql(id);
      results[1].should.be.eql("TEST");
      done();
    });
        
    client.on('connect', function(data){
      bot.status("TEST");
    });
  });
});