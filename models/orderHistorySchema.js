const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  productId: String,
  orderId: String,
  amount: String,
  currency: String,
  email: String,
  contact: String,
  accountEmailOrPhone: String,
  account: String,
  timestamp: Date
});

const OrderNewHistory = mongoose.model("OrderNewHistory", orderHistorySchema);

module.exports = OrderNewHistory;
