const router = require('express').Router()

const User = require('../models/user')
const handleValidationError = require('../utils/handleValidationError')
const validateRequestProps = require('../utils/validateRequestProps')
const generateRandomString = require('../utils/generateRandomString')
const mailer = require('../modules/mailer')

function signIn(req, res, user, message = 'Authentication successful'){
  user.checkPassword(req.body.password, (checkPasswordError, isMatch, token) => {
    if (checkPasswordError) return res.status(500).json({ message: 'Something went wrong while checking password match' })
    if (isMatch) return res.status(202).json({ message, token, payload: { user: user.email, roles: user.roles } })
    return res.status(401).json({ message: 'Invalid password' })
  })
}

router.post('/', (req, res) => {
  validateRequestProps.headers(req, res, { 'content-type': 'application/json' })

  // Check if email is already in use
  User.findOne({ email: req.body.email.toLowerCase() }, (findError, existingUser) => {
    if (findError) return res.status(500).json({ message: 'Error while checking user existence' })
    if (existingUser) return signIn(req, res, existingUser, 'User exists, signed in')

    const user = User({
      email: req.body.email,
      password: req.body.password,
      verificationToken: generateRandomString(100)
    })
    user.save((err) => {
      if (err) {
        if (err.name === 'ValidationError') return handleValidationError(err, res)
        return res.status(500).json({ message: 'Error while creating new user' })
      }
      mailer.sendVerificationToken(user.email, user.verificationToken)
      return signIn(req, res, user, 'Created new account, confirm your email')
    })

  }) // User.findOne
}) // router.post

router.get('/confirm/:email/:token', (req, res) => {
  User.findOne({ email: req.params.email }, (findErr, user) => {
    if (findErr) return res.status(500).json({ message: 'Error while finding user' })
    if (!user) return res.status(422).json({ message: 'User not found' })
    console.log(user.verifyToken, req.params.token)
    if (user.verificationToken === req.params.token) {
      user.verificationToken = undefined
      user.verified = true
      user.save((saveErr) => {
        if (saveErr) return res.status(500).json({ message: 'Something went wrong while updating user' })
        return signIn(req, res, user, 'Email confirmed, new access token provided')
      })
      return res.status(202).json({ message: 'Email verified' })
    } else return res.status(401).json({ message: 'Invalid token' })
  })
})

module.exports = router
