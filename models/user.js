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
  roles: {
    type: Array,
    'default': ['Unverified'],
  },
})

UserSchema.pre('save', function (next){
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 10, (hashingError, hashedPassword) => {
      this.password = hashedPassword
      next()
    })
  } else next()
})

UserSchema.methods.checkPassword = function(inputPassword, callback) {
  bcrypt.compare(inputPassword, this.password, (bcryptCompareError, isMatch) => {
    if (bcryptCompareError) return callback(bcryptCompareError)
    if (isMatch) {
      const tokenPayload = lodash.pick(this, ['email', 'roles'])
      const token = jwt.sign(tokenPayload, global.config.secret, {
        expiresIn: 1337,
      })
      return callback(null, true, token)
    } else callback(null, false)
  })
}

module.exports = mongoose.model('User', UserSchema)
