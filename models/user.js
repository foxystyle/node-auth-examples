const mongoose = require('mongoose')
const validator = require('validator')

const Schema = mongoose.Schema

module.exports = mongoose.model('User', new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 254,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: 'Email validation failure',
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 8, // this mostly will be ignored since password is hashed
  },
  roles: {
    type: Array,
    'default': ['Basic']
  }
}))
