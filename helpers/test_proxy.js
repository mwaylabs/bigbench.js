var http  = require('http'),
    url   = require('url'),
    proxy = http.createServer(function(request, response) {
      var options = url.parse(request.url);
      
      console.log(request);
  
      // Log
      console.log("\n-> Proxying");
      console.log(request.headers);
      console.log(options);
  
      // Request
      var proxy = http.request(options, function(res) {
        response.writeHead(res.statusCode, res.headers);
        res.on('data', function (chunk) { response.write(chunk); });
        res.on('end', function (chunk) { response.end(); });
      }).end();
      
    }).listen(9000);

proxy.on('error', function (e) {
  console.log("\n-> Error: Could not Proxy");
  console.log(e);
});

http.createServer(function(request, response) {
  response.end("Ok");
}).listen(9001);