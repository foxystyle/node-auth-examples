const mongoose = require('mongoose')

const Schema = mongoose.Schema

module.exports = mongoose.model('User', new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 3,
  },
  password: {
    type: String,
    require: true,
    minlength: 8,
  },
}))
