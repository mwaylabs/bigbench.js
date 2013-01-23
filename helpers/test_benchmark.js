{
  duration:     20,    // duration in seconds
  concurrency:  1,     // concurrent requests
  delay:        0,     // pause in milliseconds between each request
  rampUp:       0,     // how many seconds should it take until all bots are active
  actions:[
    {
      name: 'Blank Page',
      hostname: 'localhost',
      path: '/wait/50',
      port: 8888,
      method: 'GET',
    }
  ]
}