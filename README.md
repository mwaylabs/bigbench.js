# BigBench
BigBench is a distributed benchmarking system based on node.js. It uses bots that can be spread across multiple machines to attack multiple web site actions and communicates over a redis store. It runs and calculates all data in real-time, regardless of the amount of bots.

* Fully Distributed Load-Testing
* Real-Time Performance Data
* Dynamic Parameters Support
* Linear Increase of Bots through RampUp
* Request Throttling through Delay Time

The concurrency of the requests is controlled by two things: The `concurrency` parameter and the amount of bots. The parameter describes how many concurrent requests each bot sends. If the parameter is set to 1, it sends a request, waits for the response and then sends the next. If it is set to 2, it sends 2 requests and initiates the next request after the first responded for each requests individually.

If too many requests are generated with a single bot, the `delay` parameter allows to slow down the request rate. It simply waits `delay` milliseconds before the next request is made.

The `rampUp` parameter allows to add more bots during the test. All bots have to be online when the test is started. It linearly starts all bots during the specified time period.

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
      duration:     120,    // duration in seconds                                                      - default 60
      concurrency:  1,      // number of concurrent requests                                            - default 1
      delay:        0,      // how many milliseconds should be paused between each request (slows down) - default 0
      rampUp:       20,     // how many seconds should it take until all bots are active                - default 0
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

## Starting and Stopping a Benchmark
After saving it you can start and stop it by calling:

    bigbench.js start
    bigbench.js stop

## Event System
The whole system publishes updates through Redis' Pub/Sub. You can subscribe to the following channels:
* **bigbench_bots_status**: Retrieve status updates of the bots like RUNNING or STOPPED
* **bigbench_benchmark_saved**: Retrieve the latest saved benchmark
* **bigbench_total_series**: Every second the current total amount of requests per second is published
* **bigbench_total_duration_series**: Every second the current total average duration of the requests is published
* **bigbench_action_<0..n>_series**: Every second the current action <0..n> amount of requests per second is published
* **bigbench_action_<0…n>_duration_series**: Every second the current action <0..n> average duration of the requests is published
* **bigbench_statistics**: After a run, the statistics for that run are published

## Testing
Run all tests with:

    NODE_ENV=test mocha

## Contributing
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
