var helper  = require('./helper'),
    series  = require('../modules/series'),
    tracker = require('../modules/tracker');

describe("Series", function(){
  
  // clear redis before every test
  beforeEach(function(done){ helper.clearRedis(done); });
  
  var benchmark = {
    duration: 60,
    rampUp:   0,
    actions:[
      {
        name: 'Blank Page',
        hostname: 'localhost',
        path: '/blank',
        port: 8888,
        method: 'GET',
      },
      {
        name: 'New Page',
        hostname: 'localhost',
        path: '/new',
        port: 8888,
        method: 'GET',
      }
    ]
  };
  
  it("captures a single moment", function(done){
    tracker.track(0, 200, 2, function(){
      tracker.track(0, 200, 5, function(){
        series.capture(benchmark, 0, function(){
          tracker.track(0, 200, 2, function(){
              series.capture(benchmark, 1, function(){
                done();
              });
          });
        });
      });
    });
  });
  
});