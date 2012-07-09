var checker = require('./checker')
var http = require('http')
var routes = require('./routes')
var stack = require('stack')
var util = require('util')

var port = process.env.PORT || 5000

http.createServer(stack(
  routes()
)).listen(port, function() {
  util.log('Listening on '+port)
  util.log('Starting checker...')
  checker()
})
