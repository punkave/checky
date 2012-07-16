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
        var errMess = ''
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
        // TODO log for every up or down change
        if (ok != site.ok) { // site status has changed
          stat = ok ? 'UP' : 'DOWN'
          db.lpush('checky:sites:'+site.name, (new Date()).toISOString()+' '+stat+' '+errMess)
          if (ok) {
            site.ok = ok // set site.ok to new status
          } else {
            // don't say it's down unless it's been down for at least 3 rounds
            db.lrange('checky:sites:'+site.name, 0, 2, function(err, prevStats) {
              var prevStatsWords
              var down = true
              for (var i=0; i<prevStats.length; i++) {
                prevStatsWords = prevStats[i].split(' ')
                console.log(prevStatsWords[1])
                // "UP" or "DOWN" should be the second word in each log message after the timestamp
                if (prevStatsWords[1] == 'UP') down = false
              }
              if (down) site.ok = ok // it's definitely down, so set status
            })
          }
        }
        if (!--pending) setIfNew(sites, sitesStr)
      })
    })
  })
}

function setIfNew(sites, sitesStr) {
  var newSitesStr = JSON.stringify(sites)
  if (newSitesStr != sitesStr) {
    util.log('Setting sites...')
    db.set('checky:sites', newSitesStr, function (err) {
      if (err) util.error(err.message)
    })
  }
}

module.exports = function() {
  setInterval(check, 180000)
}
