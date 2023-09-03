const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({

    orderId: String,
    amount: String,
    currency: String,
    email: String,
    contact: String,
    productId: String,


})

const Purchase = new mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;