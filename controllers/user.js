const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const bcrypt = require('bcrypt')

router.post('/signup', (req, res) => {
  // Check if valid headers were sent in request
  if (!req.headers['content-type']) return res.status(400).json({ message: 'Missing Content-Type header' })
  if (req.headers['content-type'] !== 'application/json') return res.status(415).json({ message: `Invalid Content-Type, expected 'application/json', given ${req.headers['content-type']}` })

  // Check if body is missing data
  if (!req.body.email) return res.status(422).json({ message: 'Request body missing `email` property', payload: 'email' })
  if (!req.body.password) return res.status(422).json({ message: 'Request body missing `password` property', payload: 'password' })

  // Validate body data
  if (req.body.email.length > 254) return res.status(422).json({ message: 'Email length too high', limit: 254 })
  if (!req.body.email.match(/^.*@.*\..*$/)) return res.status(422).json({ message: 'Email format invalid' })
  if (req.body.password.length < 8) return res.status(422).json({ message: 'Password too short', limit: 8 })
  if (req.body.password.length > 666) return res.status(422).json({ message: 'Password too long', limit: 666 })

  // Check if email is already in use
  User.findOne({ email: req.body.email }).lean().exec((err, existingUser) => {
    if (err) return res.status(500).json({ message: 'Error while checking user existence' })
    if (existingUser) return res.status(409).json({ message: 'Email already in use' })

    // Hash password
    bcrypt.hash(req.body.password, 10, (hashingError, hashedPassword) => {
      if (hashingError) return res.status(500).json({ message: 'Something went wrong while hashing your password' })

      // Save user instance to database
      const user = User({
        email: req.body.email,
        password: hashedPassword
      })
      user.save((err) => {
        if (err) return res.status(500).json({ payload: 'Error while creating new user' })
        return res.status(201).json({ payload: 'User created' })
      })

    }) // bcrypt.hash
  }) // User.findOne
}) // router.post

router.post('/authenticate', (req, res) => {
  // Check if valid headers were sent in request
  if (!req.headers['content-type']) return res.status(400).json({ message: 'Missing Content-Type header' })
  if (req.headers['content-type'] !== 'application/json') return res.status(415).json({ message: `Invalid Content-Type, expected 'application/json', given ${req.headers['content-type']}` })

  // Check if body is missing data
  if (!req.body.email) return res.status(422).json({ message: 'Request body missing `email` property', payload: 'email' })
  if (!req.body.password) return res.status(422).json({ message: 'Request body missing `password` property', payload: 'password' })

  User.findOne({ email: req.body.email }).lean().exec((err, user) => {
    if (err) return res.status(401).json({ message: 'Error while searching for user' })
    if (!user) return res.status(401).json({ message: 'User not found' })

    bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Something went wrong while checking password match' })
      if (isMatch) {
        delete user.password // exclude password from being part of the token
        const token = jwt.sign(user, global.config.secret, {
          expiresIn: 1440 // 1h
        })
        return res.status(202).json({ message: 'Authentication successful', token })
      } else return res.status(401).json({ message: 'Invalid password' })
    })

  })
})

module.exports = router
