// Configuration for test environment loaded using NODE_ENV=test
var test = {
  name: "test",
  redis: {
    host: "localhost",
    port: 6379
  },
  websocket: {
    port: 3001
  }
};

// Configuration for development environment loaded using NODE_ENV=development
var development = {
  name: "development",
  redis: {
    host: "localhost",
    port: 6379
  },
  websocket: {
    port: 3001
  }
};

// Configuration for production environment loaded using NODE_ENV=production or nothing
var production = {
  name: "production",
  redis: {
    host: "ADD_AN_IP_HERE",
    port: 6379,
    password: "ADD_A_PASSWORD_HERE"
  },
  websocket: {
    port: 3001
  }
};

var environments = {
  "test":         test,
  "development":  development,
  "production":   production
};

// Loads a config.js from the current working directory or the default config from the environments
var config;
try{      config = require(process.cwd() + "/config.js");        }
catch(e){ config = environments[process.env.NODE_ENV || "test"]; }

// returns the config
module.exports = config;