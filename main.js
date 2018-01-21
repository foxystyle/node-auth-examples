const server = require('express')()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const proxy = require('http-proxy-middleware')
const morgan = require('morgan')
const exphbs = require('express-handlebars')


global.config = require('./config')
const mailer = require('./modules/mailer')
const authenticate = require('./middlewares/authenticate')

mailer.createTestInstance()
mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/demo', {
  useMongoClient: true,
}).then((mongoConnection) => {
  global.mongoConnection = mongoConnection

  // Logging
  server.use(morgan('METHOD: :method, URL: :url, STATUS: :status, TIME: :response-time ms'))

  // Body parser
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(bodyParser.json())

  // Cookie parser
  server.use(cookieParser())

  // Enable handlebars view engine
  const hbs = exphbs.create({})
  server.engine('handlebars', hbs.engine, { defaultLayout: 'base' })
  server.set('view engine', 'handlebars')

  server.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(422).json({ message: 'Invalid JSON provided' })
    return next()
  })

  // Proxy
  server.use('/u', authenticate, proxy({
    target: 'http://localhost:4000',
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      proxyReq.setHeader('x-access-identity-email', req.decodedToken.email)
    },
  }))

  // Controllers
  server.use(require('./controllers'))

  // 404
  server.all('*', (req, res) => res.status(404).send('Not found'))

  // Port
  server.listen(global.config.port || 3000)

})
.catch(e => console.error(e))
