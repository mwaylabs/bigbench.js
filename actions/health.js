var config  = require("../config/config"),
    header  = require("../modules/header"),
    storage = require("../modules/storage"),
    finder  = require('../modules/finder'),
    tracker = require('../modules/tracker');


// The actual adrequest
exports.call = function(request, response){
  response.writeHead(200, header.default);
  response.end(JSON.stringify({ system: "YOOSE API", version: 3.0, message: "I'm feeling healthy!" }));
};