const server = require('express')()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const proxy = require('http-proxy-middleware')

global.config = require('./config/config')
const mailer = require('./modules/mailer')
const authenticate = require('./middlewares/authenticate')

mailer.createTestInstance()
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/demo', {
  useMongoClient: true,
}).then((mongoConnection) => {
  global.mongoConnection = mongoConnection

  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(bodyParser.json())

  server.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(422).json({ message: 'Invalid JSON provided' })
    return next()
  })

  const proxyOptions = {
    target: 'http://localhost:4000',
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      proxyReq.setHeader('x-identify-email', req.decodedToken.email)
    },
  }

  server.use('/u', authenticate, proxy(proxyOptions))

  server.use(require('./controllers'))

  server.listen(3000)

})
.catch(e => console.error(e))
