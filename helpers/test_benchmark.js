{
  duration: 300,    // duration in seconds
  delay:    100,    // pause in milliseconds between each request
  rampUp:   0,      // how many seconds should it take until all bots are active
  actions:[
    {
      name: 'Blank Page',
      hostname: 'localhost',
      path: '/blank',
      port: 8888,
      method: 'GET',
    }
  ]
}