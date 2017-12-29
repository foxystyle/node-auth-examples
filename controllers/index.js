const router = require('express').Router()
const authenticate = require('../middlewares/authenticate')

router.use('/auth', require('./auth'))
router.use('/protected', authenticate, require('./protected'))

module.exports = router
