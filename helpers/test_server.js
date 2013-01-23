var express = require('express'),
    app = express();
    
app.use(express.bodyParser());

// 200 if GET /blank
app.get('/blank', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.end("Ok");
});

// 200 after :delay ms if GET /wait
app.get('/wait/:delay', function(req, res){
  var delay = parseInt(req.params.delay);
  setTimeout(function(){
    res.setHeader('Content-Type', 'text/plain');
    res.end("Ok after " + delay + " ms");
  }, delay);
});

// 200 if GET /params?say=hello&to=me
app.get('/params', function(req, res){
  if(req.query.say === "hello" && req.query.to === "me"){
    res.setHeader('Content-Type', 'text/plain');
    res.end("Ok");
  } else {
    res.send(500, 'Parameters not here!');
  }
});

// 200 if POST /upload
app.post('/upload', function(req, res){
  if(req.body.say === "hello" && req.body.to === "me"){
    res.setHeader('Content-Type', 'text/plain');
    res.end("Ok");
  } else {
    res.send(500, 'Parameters not here!');
  }
});

app.listen(8888);