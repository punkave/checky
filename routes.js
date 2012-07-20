var db = require('./db')
var router = require('choreographer').router()
var settings = require('./settings')
var url = require('url')
var util = require('util')

router.get('/', function(req, res) {
  var sites
  db.get('checky:sites', function(err, sites) {
    if (err) return err500(err, res)
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(sites)
  })
})

router.post('/', function(req, res) {
  var body = ''
  var query = url.parse(req.url, true).query
  if (!query.key) {
    res.writeHead(400)
    return res.end()
  }
  if (query.key != settings.secret) {
    res.writeHead(403)
    return res.end()
  }
  req.setEncoding('utf8')
  req.on('data', function(chunk) {
    body += chunk
  })
  req.on('end', function() {
    var sites
    try {
      sites = JSON.parse(body)
    } catch (e) {
      res.writeHead(400)
      return res.end()
    }
    for (var i=0; i<sites.length; i++) {
      sites[i].ok = true
    }
    db.set('checky:sites', JSON.stringify(sites), function(err) {
      if (err) return err500(err, res)
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end('{"ok":true}')
    })
  })
})

router.get('/*', function(req, res, next, siteSlug) {
  db.get('checky:sites', function(err, sitesVal) {
    if (err) return err500(err, res)
    var sites = JSON.parse(sitesVal)
    var found
    for (var i=0; i<sites.length; i++) {
      if (sites[i].slug == siteSlug) {
        found = true
        break
      }
    }
    if (!found) return next()
    db.lrange('checky:sites:'+siteSlug, 0, 299, function(err, log) {
      if (err) return err500(err, res)
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(log))
    })
  })
})

module.exports = function() {
  return router
}

function err500(err, res) {
  util.log(err.message)
  res.writeHead(500)
  res.end()
}
