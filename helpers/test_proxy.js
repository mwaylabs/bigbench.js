var http  = require('http'),
    url   = require('url'),
    proxy = http.createServer(function(request, response) {
      
      // Parse Options for Tunnel Request
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
  
      // Tunnel Request
      var tunnelRequest = http.request(options, function(tunnelResponse) {
        response.writeHead(tunnelResponse.statusCode, tunnelResponse.headers);
        tunnelResponse.on('data', function (chunk) {  response.write(chunk); });
        tunnelResponse.on('end', function () {        response.end(); });
        tunnelResponse.resume();
      });
      tunnelRequest.on('error', function(e) {
        console.log('Error with tunnelRequest: ' + e.message);
      });
      
      // POST requests need to wait for all data to be fetched before tunnel request
      // can be send. All others can be sent right away
      if(request.method !== "GET"){
        request.on('data', function (chunk) { tunnelRequest.write(chunk); });
        request.on('end', function(){         tunnelRequest.end(); });
      } else{
        tunnelRequest.end();
      }
      
    }).listen(9000);



http.createServer(function(request, response) {
  response.end("Ok");
}).listen(9001);