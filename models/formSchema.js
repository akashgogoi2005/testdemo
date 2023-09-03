const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  level: {
    type: String,
    maxlength: 2,
    required: true
  },
  title: {
    type: String,
    maxlength: 70,
    required: true
  },
  elitePass: {
    type: String,
    maxlength: 2,
    required: true
  },
  availableDiamonds: {
    type: Number,
    required: true
  },
  totalWorth: {
    type: Number,
    required: true
  },
  sellPrice: {
    type: Number,
    required: true
  },
  accountType: {
    type: String,
    enum: ['Facebook', 'Google', 'Twitter', 'VK'],
    required: true
  },
  description: {
    type: String,
    maxlength: 400
  },
  accountEmailOrPhone: {
    type: String,
    required: true
  },
  accountPassword: {
    type: String,
    required: true
  }
});

const Form = mongoose.model('SellForm', formSchema);

module.exports = Form;

