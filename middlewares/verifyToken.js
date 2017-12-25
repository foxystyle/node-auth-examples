const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token']
  if (token) {
    jwt.verify(token, global.config.secret, (err, decoded) => {
      if (err) return res.status(401).json({ payload: 'Token verification failed' })
      req.decoded = decoded
      next()
    })
  } else return res.status(401).json({ payload: 'Missing authentication token' })
}
