const server = require('express')()
const bodyParser = require('body-parser')

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

server.get('/u/whoami', (req, res) => {
  const email = req.headers['x-access-identity-email']
  res.status(200).json({ email })
})

// server.get('/u/limited', (req, res) => {
//   const { accountType } = req.decodedToken
//   if (accountType === 'Basic') return res.status(200).json({ message: 'Basic access' })
//   if (accountType === 'Admin') return res.status(200).json({ message: 'Admin access' })
//   return res.status(401).json({ message: 'No access. You are unverified' })
// })

server.get('/', (req, res) => {
  console.log('I am unreachable')
  res.status(200).json({ message: 'Ohh hello from server on port 4000' })
})

server.get('/proxy/proxy', (req, res) => {
  res.status(200).json({ message: 'Proxy proxy!' })
})

server.all('*', (req, res) => {
  res.status(404).json({ message: 'Not found' })
})

server.listen(4000)
