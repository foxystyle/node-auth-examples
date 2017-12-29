const router = require('express').Router()

router.get('/whoami', (req, res) => {
  const { email, accountType } = req.decodedToken
  res.status(200).json({ email, accountType })
})

router.get('/limited', (req, res) => {
  const { accountType } = req.decodedToken
  if (accountType === 'Basic') return res.status(200).json({ message: 'Basic access' })
  if (accountType === 'Admin') return res.status(200).json({ message: 'Admin access' })
  return res.status(401).json({ message: 'No access. You are unverified' })
})

module.exports = router
