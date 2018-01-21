const server = require('express')()
const bodyParser = require('body-parser')
const path = require('path')
const morgan = require('morgan')

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

server.use(morgan('METHOD: :method, URL: :url, STATUS: :status, TIME: :response-time ms'))

server.get('/u/whoami', (req, res) => {
  const email = req.headers['x-access-identity-email']
  res.status(200).json({ email })
})

server.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './form.html')))

server.get('/', (req, res) => {
  console.log('I am unreachable by proxy')
  res.status(200).json({ message: 'Ohh hello from server on port 4000' })
})

// /u is accessible from proxy (shouldn't be accessible as public url)
server.get('/u/limited', (req, res) => {
  const { accountType } = req.decodedToken
  if (accountType === 'Basic') return res.status(200).json({ message: 'Basic access' })
  if (accountType === 'Admin') return res.status(200).json({ message: 'Admin access' })
  return res.status(401).json({ message: 'No access. You are unverified' })
})

server.all('*', (req, res) => {
  res.status(404).json({ message: 'Not found' })
})

server.listen(4000, () => console.log(4000))
