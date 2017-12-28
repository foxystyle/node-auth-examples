const router = require('express').Router()
const authenticate = require('../middlewares/verifyToken')

router.use('/auth', require('./auth'))
router.use('/protected', authenticate, require('./protected'))

module.exports = router
