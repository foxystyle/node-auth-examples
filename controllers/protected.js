const router = require('express').Router()

router.get('/whoami', (req, res) => {
  res.status(200).json(req.decoded)
})

module.exports = router
