var http  = require('http'),
    url   = require('url'),
    proxy = http.createServer(function(request, response) {
      var parsedOptions = url.parse(request.url),
          options       = {
            hostname : parsedOptions.hostname,
            port     : parseInt(parsedOptions.port),
            path     : parsedOptions.path,
            method   : request.method,
            headers  : request.headers
          };
  
      // Log
      console.log("\n-> Proxying");
      console.log(request.headers);
      console.log(options);
  
      // Request
      var proxy = http.request(options, function(res) {
        response.writeHead(res.statusCode, res.headers);
        res.on('data', function (chunk) { response.write(chunk);  });
        res.on('end', function (chunk) {  response.end();         });
      })
      
      // Body on Post
      if(request.method !== "GET"){
        request.on('data', function (data) { proxy.write(data); });
      }
      
      // Incomung Request Completed
      request.on('end', function (data) { proxy.end(); });
      
    }).listen(9000);

proxy.on('error', function (e) {
  console.log("\n-> Error: Could not Proxy");
  console.log(e);
});

http.createServer(function(request, response) {
  response.end("Ok");
}).listen(9001);