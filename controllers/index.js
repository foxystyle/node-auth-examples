const router = require('express').Router()
const authenticate = require('../middlewares/authenticate')

// Custom auth (using JWT access tokens)
router.use('/auth', require('./customAuth'))

// Passport auth using local strategy
router.use('/pass', require('./passportAuth'))

// Protected route
router.use('/protected', authenticate, require('./protected'))

module.exports = router
