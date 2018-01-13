const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const lodash = require('lodash')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    minlength: [3, 'Email too short'],
    maxlength: [254, 'Email too long'],
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: 'Email not valid',
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password too short'],
  },
  verified: {
    required: true,
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
}, {
  timestamps: true,
})

UserSchema.pre('save', function (next){
  this.email = this.email.toLowerCase()
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 10, (hashingError, hashedPassword) => {
      this.password = hashedPassword
      next()
    })
  } else next()
})

UserSchema.methods.matchPassword = function(inputPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(inputPassword, this.password, (bcryptCompareError, isMatch) => {
      if (bcryptCompareError) return reject(bcryptCompareError)
      if (isMatch) return resolve(true)
      else return resolve(false)
    })
  })
}

UserSchema.methods.createAccessToken = function(){
  return new Promise((resolve, reject) => {
    const tokenPayload = lodash.pick(this, ['email', 'accountType'])
    jwt.sign(tokenPayload, global.config.secret, {
      expiresIn: 1337,
    }, (err, token) => {
      if (err) return reject(err)
      resolve(token)
    })
  })
}

module.exports = mongoose.model('User', UserSchema)
