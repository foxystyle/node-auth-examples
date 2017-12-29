const server = require('express')()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

global.config = require('./config/config')
const mailer = require('./modules/mailer')

mailer.createTestInstance()
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/demo', {
  useMongoClient: true
}).then((mongoConnection) => {
  global.mongoConnection = mongoConnection

  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(bodyParser.json())

  server.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(422).json({ message: 'Invalid JSON provided' })
    return next()
  })

  server.get('/', (req, res) => {
    res.status(200).json({ payload: 'Hello world' })
  })

  server.use(require('./controllers'))

  server.listen(3000)

})
.catch(e => console.error(e))
