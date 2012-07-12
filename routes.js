var db = require('./db')
var router = require('choreographer').router()
var util = require('util')

router.get('/', function(req, res) {
  var sites
  db.get('checky:sites', function(err, sites) {
    if (err) {
      util.log(err.message)
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
    for (var i=0; i<sites.length; i++) {
      sites[i].ok = true
    }
    db.set('checky:sites', JSON.stringify(sites))
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end('{"ok":true}')
  })
})

module.exports = function() {
  return router
}
