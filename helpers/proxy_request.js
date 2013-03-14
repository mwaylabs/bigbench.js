var http = require('http');

var options = {
  hostname: '54.241.146.202',
  port: 8081,
  path: 'http://www.bild.de',
  method: 'GET',
  headers: { 'host': 'www.bild.de', 'user-agent': 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5' }
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(e) {
  console.log(e.message);
});

// write data to request body
req.end();