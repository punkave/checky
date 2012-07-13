var util = require('util')

if (process.env.SECRET) {
  exports.secret = process.env.SECRET
} else {
  util.log('No secret key provided for API. Using default instead.')
  exports.secret = 'SEKRIT'
}
