var redis = require('redis').createClient()
var router = require('choreographer').router()
var util = require('util')

router.get('/', function(req, res) {
  var sites
  redis.get('checky:sites', function(err, sites) {
    if (err) {
      util.error(err.message)
      res.writeHead(500)
      res.end()
    }
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(sites)
  })
})

router.post('/', function(req, res) {
  var body = ''
  req.setEncoding('utf8')
  req.on('data', function(chunk) {
    body += chunk
  })
  req.on('end', function() {
    var sites = JSON.parse(body)
    for (var key in sites) {
      sites[key].ok = true
    }
    redis.set('checky:sites', JSON.stringify(sites))
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end('{"ok":true}')
  })
})

module.exports = function() {
  return router
}
