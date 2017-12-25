const server = require('express')()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
global.config = require('./config/config')

const jwt = require('jsonwebtoken')
const User = require('./models/user')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/demo', {
  useMongoClient: true
}).then((mongoConnection) => {
  server.use(bodyParser.json())

  server.get('/', (req, res) => {
    res.status(200).json({ payload: 'Hello world' })
  })

  server.use(require('./controllers'))

  server.listen(3000)

})
.catch(e => console.error(e))
