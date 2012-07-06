var redis = require('redis').createClient()
var request = require('request')

function check() {
  redis.get('checky:sites', function(err, sites) {
    sites.forEach(function(site) {
      request(site.url, function(err, res, body) {
        // TODO check each site and update sites as needed
      })
    })
  })
}
setInterval(check(), 5000)
