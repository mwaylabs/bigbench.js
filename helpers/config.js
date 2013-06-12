// This config.js overrides the default configuration.
// Place it in the same directory you start bigbench-*.js in and it will get loaded automatically.
module.exports = {
  redis: {
    host: "localhost",
    port: 6379
  },
  websocket: {
    port: 3001
  }
}