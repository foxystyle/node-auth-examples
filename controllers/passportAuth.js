const router = require('express').Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('connect-flash')

const User = require('../models/user')

passport.use(new LocalStrategy({
  usernameField: 'email',
}, (email, password, done) => {
  User.findOne({ email }, (err, user) => {
    if (err) return done(err)
    if (!user) return done(null, false, { message: 'User not found' })
    user.matchPassword(password)
    .then(
      isMatch => isMatch ?
      done(null, user) : done(null, false, { message: 'Incorrect password' })
    )
    .catch(e => done(e))
  })
}))

// Passport local
router.use(session({
  secret: global.config.secret,
  saveUninitialized: false,
  resave: false,
}))

// Enable flash messages
router.use(flash())

router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser((user, done) => done(null, user.email))

passport.deserializeUser((email, done) => User.find({ email }, (err, user) => done(err, user)))

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/pass/home')
    }
    req.logIn(user, (loginErr) => {
      if (err) return next(loginErr)
      req.flash('success', 'Login successful')
      return res.redirect('/pass/home')
    })
  })(req, res, next)
})

router.post('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'Logged out successfully')
  res.redirect('/pass/home')
})

router.get('/test', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in to visit targeted resource')
    res.redirect('/pass/home')
  } else {
    req.user && res.send('Hello user!')
  }
})

// Example routes
router.get('/home', (req, res) => {
  const flashSuccess = req.flash('success')
  const flashError = req.flash('error')
  console.log('user', req.user && req.user[0])
  res.render('home', {
    flashSuccess,
    flashError,
    isAuthenticated: req.isAuthenticated(),
    user: req.user && req.user[0],
  })
})


module.exports = router
