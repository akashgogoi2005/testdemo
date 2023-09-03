const mongoose = require('mongoose');

const redeemCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
  // expireAt: {
  //   type: Date,
  //   // required: true
  // }
});

// Create an index on the `expireAt` field for automatic expiration
// redeemCodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const RedeemCode = mongoose.model('RedeemCode', redeemCodeSchema);

module.exports = RedeemCode;
