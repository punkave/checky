var db = require('./db')
var request = require('request')
var util = require('util')

function check() {
  db.get('checky:sites', function(err, sitesStr) {
    var sites = JSON.parse(sitesStr) || []
    var pending = sites.length
    sites.forEach(function(site, i) {
      util.log('Checking '+site.name+'...')
      request.head(site.url, function(err, res) {
        var ok = true
        var errMess
        var stat
        if (err) {
          errMess = err.message
          util.log(errMess)
          ok = false
        } else {
          if (res.statusCode !== 200) {
            errMess = res.statusCode
            util.log(errMess)
            ok = false
          }
        }
        if (ok != site.ok) { // site status has changed
          stat = ok ? 'UP' : 'DOWN'
          errMess = errMess ? ' ' + errMess : ''
          db.lpush('checky:sites:'+site.slug, (new Date()).toISOString()+' '+stat+errMess)
          site.ok = ok // set site.ok to new status
        }
        if (!--pending) setIfNew(sites, sitesStr)
      })
    })
  })
}

function setIfNew(sites, sitesStr) {
  var newSitesStr = JSON.stringify(sites)
  if (newSitesStr != sitesStr) {
    util.log('One or more site statuses have changed...')
    db.set('checky:sites', newSitesStr, function (err) {
      if (err) util.error(err.message)
    })
  }
}

module.exports = function() {
  setInterval(check, 180000)
}
