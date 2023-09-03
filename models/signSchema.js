const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true,
    unique: true
  },
  email: {
    type: String,
    // required: true,
    unique: true
  },
  password: {
    type: String,
    // required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SignUser = mongoose.model('SignUser', signSchema);

module.exports = SignUser;
