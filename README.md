# BigBench

Todo

## Install

To install bigbench run:

    sudo npm install bigbench -g

## Configuration

By default bigbench tries to connect to a redis on the localhost on port 6379. You can supply a custom
connection by creating a file named `config.js` in the same directory then bigbench is running in (pwd):

    module.exports = {
      redis: {
        host: "localhost",
        port: 6379,
        password: "ADD_A_PASSWORD_HERE"
      }
    }

The config will automatically be loaded if it exists.

## Create and Save a Benchmark

A benchmark consists of a few global variables like `duration` and `rampUp` time and the actions that should be tested. Each
action is a URL that is requested during the test.

### Scaffolding a Benchmark

For an initial benchmark simply run:

    bigbench.js new

This will create a sample benchmark that basically explains everything. To save it to the system run:

    bigbench.js save benchmark.js

After you started the amount of bots you want to test with you can initiate the benchmark by running:

    bigbench.js start

and watch the progress with the `bigbench-monitor.js`

## Sample Benchmark

    {
      duration: 120,    // duration in seconds
      delay:    0,      // how many milliseconds should be paused between each request (slows down) - default 0
      rampUp:   20,     // how many seconds should it take until all bots are active                - default 0
      actions:[
        {
          name: 'Google Startpage',
          hostname: 'www.google.com',
          path: '/',
          port: 80,
          method: 'GET',
        },
        {
          name: 'Google Search',
          hostname: 'www.google.com',
          path: '/',
          port: 80,
          method: 'GET',
          params: { q: 'southdesign' }
        },
        {
          name: 'Basic Auth Page',
          hostname: 'www.website.com',
          path: '/secret',
          port: 80,
          method: 'GET',
          auth: 'user:password'
        },
        {
          name: 'Function for Dynamic Params',
          hostname: 'www.google.com',
          path: '/',
          port: 80,
          method: 'GET',
          params: function(){
            var index = Math.floor(Math.random() * 3),
                terms = ['one', 'of', 'these'];
            return { q: terms[index] };
          }
        },
        {
          name: 'Posting Content',
          hostname: 'www.google.com',
          path: '/signin',
          port: 80,
          method: 'POST',
          params: { user: 'credentials' }
        }
      ]
    }

## Starting a Bot

To start a bot simply run:

    bigbench-bot.js

## Starting the Monitor

To follow a test watch the monitor. It will show everything you need:

    bigbench-monitor.js

## Starting/Stopping a Benchmark

After saving it you can start and stop it by calling:

    bigbench.js start
    bigbench.js stop

## Testing

Run all tests with:

    NODE_ENV=test mocha

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
