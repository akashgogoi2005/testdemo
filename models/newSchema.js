const mongoose = require("mongoose");

const newSchema = new mongoose.Schema({

    id: {
        type: String,
    },
    fname: {
        type: String,
        required: true
    },
    imgpath: {
        type: String,
        required: true
    },
    imgpath1: {
        type: String,
    },
    imgpath2: {
        type: String,
    },
    imgpath3: {
        type: String,
    },
    imgpath4: {
        type: String,
    },
    date: {
        type: Date
    },
    public_id: {
        type: String,
        required: true
    },
    level: {
        type: String,
        maxlength: 2,
        required: true
    },
    title: {
        type: String,
        maxlength: 25,
        required: true
    },
    elitePass: {
        type: String,
        maxlength: 2,
        required: true
    },
    likes: {
        type: String,
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
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Bank Account'],
        required: true
    },
    upiId: {
        type: String
    },
    bankAccountNumber: {
        type: String
    },
    ifscCode: {
        type: String
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    discountPrice: {
        type: Number
    },
    available: {
        type: String,
        default: 'In Trade'
    }
});


// newSchema.pre('save', function (next) {
//     this.discountPrice = this.totalWorth - this.sellPrice;
//     this.discountPercentage = (((this.totalWorth - this.sellPrice) / this.totalWorth) * 100).toFixed(0);
//     next();
// });

newSchema.pre('save', function (next) {
    this.discountPrice = this.totalWorth - this.sellPrice;
    this.discountPercentage = (((this.totalWorth - this.sellPrice) / this.totalWorth) * 100).toFixed(0);
    next();
});


//create model

const uploadsSchema = new mongoose.model("uploads", newSchema)

module.exports = uploadsSchema;