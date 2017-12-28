const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const lodash = require('lodash')

const User = require('../models/user')
const handleValidationError = require('../utils/handleValidationError')
const validateRequestProps = require('../utils/validateRequestProps')

router.use((req, res, next) => {
  validateRequestProps.headers(req, res, { 'content-type': 'application/json' })
  next()
})

router.post('/auth', (req, res) => {
  // Check if body is missing data
  validateRequestProps.body(req, res, ['email', 'password'])

  // Validate body data
  if (req.body.email.length > 254) return res.status(422).json({ message: 'Email too long', limit: 254 })
  if (!req.body.email.match(/^.*@.*\..*$/)) return res.status(422).json({ message: 'Email format invalid' })
  if (req.body.password.length < 8) return res.status(422).json({ message: 'Password too short', limit: 8 })
  if (req.body.password.length > 666) return res.status(422).json({ message: 'Password too long', limit: 666 })

  // Check if email is already in use
  User.findOne({ email: req.body.email }).lean().exec((findError, existingUser) => {
    if (findError) return res.status(500).json({ message: 'Error while checking user existence' })

    if (existingUser) {
      User.findOne({ email: req.body.email }).lean().exec((findUserError, user) => {
        if (findUserError) return res.status(401).json({ message: 'Error while searching for user' })
        if (!user) return res.status(401).json({ message: 'User not found' })

        bcrypt.compare(req.body.password, user.password, (bcryptCompareError, isMatch) => {
          if (bcryptCompareError) return res.status(500).json({ message: 'Something went wrong while checking password match' })
          if (isMatch) {
            const tokenPayload = lodash.pick(user, ['_id', 'email'])
            const token = jwt.sign(tokenPayload, global.config.secret, {
              expiresIn: 1440,
            })
            return res.status(202).json({ message: 'Authentication successful', token })
          } else return res.status(401).json({ message: 'Invalid password' })
        })

      })
    } else {
      // Hash password
      bcrypt.hash(req.body.password, 10, (hashingError, hashedPassword) => {
        if (hashingError) return res.status(500).json({ message: 'Something went wrong while hashing your password' })

        // Save user instance to database
        const user = User({
          email: req.body.email,
          password: hashedPassword,
        })
        user.save((err) => {
          if (err) {
            if (err.name === 'ValidationError') return handleValidationError(err, res)
            return res.status(500).json({ message: 'Error while creating new user' })
          }
          return res.status(201).json({ message: 'User created', payload: lodash.pick(user, ['_id', 'email']) })
        })
      }) // bcrypt.hash
    }

  }) // User.findOne
}) // router.post

module.exports = router
