const router = require('express').Router()
const verifyToken = require('../middlewares/verifyToken')

router.use('/user', require('./user'))
router.use('/protected', verifyToken, require('./protected'))

module.exports = router
