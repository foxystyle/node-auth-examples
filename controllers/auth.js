const router = require('express').Router()

const User = require('../models/user')
const handleValidationError = require('../utils/handleValidationError')
const validateRequestProps = require('../utils/validateRequestProps')

router.post('/', (req, res) => {
  validateRequestProps.headers(req, res, { 'content-type': 'application/json' })

  function signIn(user, newUser = false){
    user.checkPassword(req.body.password, (checkPasswordError, isMatch, token) => {
      if (checkPasswordError) return res.status(500).json({ message: 'Something went wrong while checking password match' })
      if (isMatch) return res.status(202).json({ message: `Authentication successful. ${newUser ? 'New account was created.' : 'Logged in to existing account.' }`, token, user: user.email, roles: user.roles })
      return res.status(401).json({ message: 'Invalid password' })
    })
  }

  // Check if email is already in use
  User.findOne({ email: req.body.email }, (findError, existingUser) => {
    if (findError) return res.status(500).json({ message: 'Error while checking user existence' })
    if (existingUser) return signIn(existingUser)

    const user = User({
      email: req.body.email,
      password: req.body.password,
    })
    user.save((err) => {
      if (err) {
        if (err.name === 'ValidationError') return handleValidationError(err, res)
        return res.status(500).json({ message: 'Error while creating new user' })
      }
      return signIn(user, true)
    })

  }) // User.findOne
}) // router.post

module.exports = router
