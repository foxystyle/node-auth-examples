const router = require('express').Router()

router.get('/', (req, res) => {
  res.status(200).json(req.decoded)
})

module.exports = router
