const express = require("express");
const router = new express.Router();
// const Products = require("../models/productsSchema");
const logins = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const Images = require("../models/imagesSchema");
const multer = require("multer");
const uploadsSchema = require("../models/newSchema");
const moment = require("moment");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Form = require("../models/formSchema");
require("dotenv").config();
const RedeemCode = require("../models/redeemCodeSchema");
const SignUser = require("../models/signSchema");
const axios = require('axios');
const Razorpay = require('razorpay');
const Purchase = require('../models/purchaseSchema');
const OrderNewHistory = require('../models/orderHistorySchema');
const OtpModel = require('../models/otpSchema');



// Route to update password
router.post('/api/update-password', async (req, res) => {
    try {
        const { mobile, newPassword } = req.body;

        if (!mobile || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide mobile number and new password' });
        }

        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 12); // 10 is the number of salt rounds

        // Update the password in the 'logins' collection
        const updatedUser = await logins.findOneAndUpdate(
            { mobile: mobile },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ success: false, message: 'User not found or failed to update password' });
        }

        return res.status(200).json({ success: true, message: 'Password updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});
  


// Route to send OTP for password reset
router.post('/api/forgot-password', async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Please enter a mobile number' });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save the OTP to the database for password reset
        await OtpModel.create({ mobileNumber: mobile, otp });

        // Call the fast2sms API to send the OTP
        const response = await axios.get(
            `https://www.fast2sms.com/dev/bulk?authorization=SLtgyZ9OzpKYU7RWF8iJ2uCTb4jr3o5BesX1AHIGdlv0cQamDh4XtcFm0GlYnWR2TyJZsApUgxa1Po3N&sender_id=FSTSMS&message=Your%20OTP%20is%20${otp}&language=english&route=p&numbers=${mobile}`
        );

        if (response.data.return === true && response.data.message === 'OTP sent successfully') {
            // OTP sent successfully
            res.json({ success: true, message: 'Password reset OTP sent successfully', otp });
        } else {
            // Failed to send OTP
            res.json({ success: false, message: 'Failed to send password reset OTP' });
        }
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send password reset OTP' });
    }
});

// Route to verify OTP for password reset
router.post('/api/verify-password-reset-otp', async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'Please enter the OTP' });
        }

        // Find the OTP document in the database for password reset
        const otpDocument = await OtpModel.findOne({ mobileNumber: mobile, otp });

        if (!otpDocument) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Check if the OTP is expired (3 minutes expiration)
        const currentTime = Date.now();
        const otpExpirationTime = otpDocument.createdAt.getTime() + 180000; // 180000 milliseconds = 3 minutes

        if (currentTime > otpExpirationTime) {
            // OTP has expired
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Mark the OTP as verified in the database
        otpDocument.isVerified = true;
        await otpDocument.save();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error verifying password reset OTP:', error);
        return res.status(500).json({ success: false, message: 'Failed to verify password reset OTP' });
    }
});






// // Route to send OTP for password reset
// router.post('/api/forgot-password', async (req, res) => {
//     try {
//         const { mobile } = req.body;

//         if (!mobile) {
//             return res.status(400).json({ success: false, message: 'Please enter a mobile number' });
//         }

//         // Generate a random 6-digit OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         // Save the OTP to the database for password reset
//         await OtpModel.create({ mobileNumber: mobile, otp });

//         // Call the fast2sms API to send the OTP
//         const response = await axios.get(
//             `https://www.fast2sms.com/dev/bulk?authorization=SLtgyZ9OzpKYU7RWF8iJ2uCTb4jr3o5BesX1AHIGdlv0cQamDh4XtcFm0GlYnWR2TyJZsApUgxa1Po3N&sender_id=FSTSMS&message=Your%20OTP%20is%20${otp}&language=english&route=p&numbers=${mobileNumber}`
//         );

//         if (response.data.return === true && response.data.message === 'Password reset OTP sent successfully') {
//             // OTP sent successfully
//             res.json({ success: true, message: 'Password reset OTP sent successfully', otp });
//         } else {
//             // Failed to send OTP
//             res.json({ success: false, message: 'Failed to send password reset OTP' });
//         }
//     } catch (error) {
//         console.error('Error sending password reset OTP:', error);
//         res.status(500).json({ success: false, message: 'Failed to send password reset OTP' });
//     }
// });

// // Route to verify OTP for password reset
// router.post('/api/verify-password-reset-otp', async (req, res) => {
//     try {
//         const { mobile, otp } = req.body;

//         if (!otp) {
//             return res.status(400).json({ success: false, message: 'Please enter the OTP' });
//         }

//         // Find the OTP document in the database for password reset
//         const otpDocument = await OtpModel.findOne({ mobileNumber: mobile, otp });

//         if (!otpDocument) {
//             return res.status(400).json({ success: false, message: 'Invalid OTP' });
//         }

//         // Check if the OTP is expired (5 minutes expiration)
//         const currentTime = Date.now();
//         const otpExpirationTime = otpDocument.createdAt.getTime() + 300000; // 300000 milliseconds = 5 minutes

//         if (currentTime > otpExpirationTime) {
//             // OTP has expired
//             return res.status(400).json({ success: false, message: 'OTP has expired' });
//         }

//         // Mark the OTP as verified in the database
//         otpDocument.isVerified = true;
//         await otpDocument.save();

//         return res.status(200).json({ success: true });
//     } catch (error) {
//         console.error('Error verifying password reset OTP:', error);
//         return res.status(500).json({ success: false, message: 'Failed to verify password reset OTP' });
//     }
// });




// Route to regenerate OTP
router.post('/api/regenerate-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({ success: false, message: 'Please enter a mobile number' });
        }

        // Generate a new random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update the OTP in the database for the given mobile number
        await OtpModel.updateOne({ mobileNumber }, { otp });

        // Call the fast2sms API to send the new OTP
        const response = await axios.get(
            `https://www.fast2sms.com/dev/bulk?authorization=SLtgyZ9OzpKYU7RWF8iJ2uCTb4jr3o5BesX1AHIGdlv0cQamDh4XtcFm0GlYnWR2TyJZsApUgxa1Po3N&sender_id=FSTSMS&message=Your%20OTP%20is%20${otp}&language=english&route=p&numbers=${mobileNumber}`
        );

        if (response.data.return === true && response.data.message === 'OTP sent successfully') {
            // OTP sent successfully
            res.json({ success: true, message: 'New OTP sent successfully', otp });
        } else {
            // Failed to send new OTP
            res.json({ success: false, message: 'Failed to send new OTP' });
        }
    } catch (error) {
        console.error('Error regenerating OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to regenerate OTP' });
    }
});



router.post('/api/check-mobile', async (req, res) => {
    try {
      const { mobile } = req.body;
      const existingUser = await logins.findOne({ mobile });
  
      if (existingUser) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking mobile number:', error);
      res.status(500).json({ error: "An error occurred while checking mobile number" });
    }
  });


router.post('/api/check-email', async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await logins.findOne({ email });
  
      if (existingUser) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking Email ID:', error);
      res.status(500).json({ error: "An error occurred while checking Email ID" });
    }
  });
  


// Route to send OTP
router.post('/api/send-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({ success: false, message: 'Please enter a mobile number' });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save the OTP to the database
        await OtpModel.create({ mobileNumber, otp });

        // Call the fast2sms API to send the OTP
        const response = await axios.get(
            `https://www.fast2sms.com/dev/bulk?authorization=SLtgyZ9OzpKYU7RWF8iJ2uCTb4jr3o5BesX1AHIGdlv0cQamDh4XtcFm0GlYnWR2TyJZsApUgxa1Po3N&sender_id=FSTSMS&message=Your%20OTP%20is%20${otp}&language=english&route=p&numbers=${mobileNumber}`
        );

        if (response.data.return === true && response.data.message === 'OTP sent successfully') {
            // OTP sent successfully
            res.json({ success: true, message: 'OTP sent successfully', otp });
        } else {
            // Failed to send OTP
            res.json({ success: false, message: 'Failed/Succesfull to send OTP' });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// Route to verify OTP
router.post('/api/verify-otp', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'Please enter the OTP' });
        }

        // Find the OTP document in the database
        const otpDocument = await OtpModel.findOne({ mobileNumber, otp });

        if (!otpDocument) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Check if the OTP is expired (5 minutes expiration)
        const currentTime = Date.now();
        const otpExpirationTime = otpDocument.createdAt.getTime() + 300000; // 300000 milliseconds = 5 minutes

        if (currentTime > otpExpirationTime) {
            // OTP has expired
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Mark the OTP as verified in the database
        otpDocument.isVerified = true;
        await otpDocument.save();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});


// Route to fetch the order history
router.get('/order-history', async (req, res) => {
    try {
        // Fetch all order history records from the database
        const orderHistory = await OrderNewHistory.find();
        // const orderHistory = await OrderNewHistory.find().sort({ timestamp: -1 });

        res.json(orderHistory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order history.' });
    }
});



// Create a new instance of Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Route to initiate the payment
router.post('/create-order', async (req, res) => {
    try {
        const amount = req.body.amount; // Amount in paisa
        const currency = 'INR'; // Change currency as per your requirements
        // Create a new order using Razorpay API
        const order = await razorpay.orders.create({ amount, currency });
        res.json({ orderId: order.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment order.' });
    }
});

// Route to verify the payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { order_id, payment_id, accountPassword, id, accountEmailOrPhone, email, contact } = req.body; // Update the property names to match the response from Razorpay
        const date = moment(new Date()).format("YYYY-MM-DD");

        // Verify the payment using Razorpay API
        const payment = await razorpay.payments.fetch(payment_id); // Update the property name to match the response from Razorpay
        if (payment.status === 'captured') {
            // Payment successful, do further processing as per your requirements

            // // Check if the product is already out of stock
            // const product = await uploadsSchema.findById(id);
            // if (product.status === 'Out of Stock') {
            //     return res.status(400).json({ error: 'Product is already Out of Stock.' });
            // }

            const newPurchase = new OrderNewHistory({
                orderId: payment.order_id,
                amount: payment.amount,
                currency: payment.currency,
                email: payment.email, // You can get the user's email from the prefill data in the client-side code
                contact: payment.contact, // You can get the user's contact from the prefill data in the client-side code
                productId: id, // Replace 'your_product_id' with the actual product ID or any identifier for the purchased product
                timestamp: date,
                account: accountPassword,
                accountEmailOrPhone: accountEmailOrPhone
            });

            await newPurchase.save();

            const productId = id; // Assuming 'id' is the _id of the product you want to update
            await uploadsSchema.updateOne({ id: productId }, { $set: { available: 'Out of Trade' } });

            return res.json({ success: true });
        } else {
            return res.status(400).json({ error: 'Payment verification failed.' });
        }
    } catch (error) {
        console.log('Error:', error); // Log the error for debugging purposes
        return res.status(500).json({ error: 'Failed to verify payment.' });
    }
});




// new profile to homepage api
router.get("/getdata", async (req, res) => {
    try {
        const getUser = await uploadsSchema.find();

        res.status(201).json({ status: 201, getUser })
    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
});


// delete user data api

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const dltUser = await users.findByIdAndDelete({ _id: id });
        res.status(201).json({ status: 201, dltUser });

    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
})


// Get individual dataindividualdata
router.get(`/trade/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id);

        const individualdata = await uploadsSchema.findOne({ id: id });

        // console.log(individualdata + "only in console individual data...");
        res.status(201).json(individualdata);

    } catch (error) {
        res.status(400).json(individualdata);
        console.log("error" + error.message);
    }
});



// Define the GET route for retrieving a single redeem code
router.get('/api/redeem-codes', async (req, res) => {
    try {
        // Find an available redeem code from the database
        const redeemCode = await RedeemCode.findOne({ assignedTo: null });

        if (!redeemCode) {
            // Handle the case when no available redeem code is found
            return res.status(404).json({ message: 'No available redeem codes' });
        }

        // Update the redeem code to mark it as assigned
        // redeemCode.assignedTo = req.user.id; // Assuming you have authentication middleware and the user ID is available in req.user.id
        await redeemCode.save();

        res.json({ code: redeemCode.code });
    } catch (error) {
        console.error('Error fetching redeem code:', error);
        res.status(500).json({ message: 'Failed to fetch redeem code' });
    }
});

// Function to assign a redeem code to a user
async function assignRedeemCodeToUser(userId) {
    // Retrieve an available redeem code from the database
    const redeemCode = await RedeemCode.findOneAndUpdate(
        { assignedTo: null },
        { $set: { assignedTo: userId } }
    );

    if (!redeemCode) {
        // Handle the case when no available redeem code is found
        throw new Error('No available redeem codes');
    }

    // Assign the redeem code to the user
    const user = await logins.findByIdAndUpdate(userId, { redeemCode: redeemCode.code });

    // Return the assigned redeem code
    return redeemCode.code;
}


router.post("/register", async (req, res) => {
    try {
        const { fname, email, mobile, password, cpassword } = req.body;

        if (!fname || !email || !mobile || !password || !cpassword) {
            return res.status(422).json({ error: "Fill in all the required fields" });
        }

        const preuser = await logins.findOne({ email: email });

        if (preuser) {
            return res.status(422).json({ error: "This user already exists" });
        } else if (password !== cpassword) {
            return res.status(422).json({ error: "Passwords do not match" });
        } else {
            const finalUser = new logins({
                fname,
                email,
                mobile,
                password,
                cpassword,
            });

            const storedata = await finalUser.save();
            const assignedRedeemCode = await assignRedeemCodeToUser(finalUser._id);

            // Combine the responses into a single response
            return res.status(201).json({
                success: true,
                redeemCode: assignedRedeemCode,
                user: storedata
            });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: "Failed to register user" });
    }
});


// THIS IS ALL NEW USERS CODE-----------------------

// // Route for user sign up
// router.post('/api/signup', async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         // Check if the username or email already exists in the database
//         const existingUser = await SignUser.findOne({ $or: [{ username }, { email }] });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username or email already exists' });
//         }

//         // Create a new user
//         const user = new SignUser({ username, email, password });

//         // Save the user
//         await user.save();

//         // Assign a redeem code to the user
//         const assignedRedeemCode = await assignRedeemCodeToUser(user._id);

//         res.json({
//             success: true,
//             message: 'User signed up successfully.',
//             redeemCode: assignedRedeemCode
//         });
//     } catch (error) {
//         console.error('Error signing up:', error);
//         res.status(500).json({ success: false, message: 'Failed to sign up user.' });
//     }
// });


// Set up Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDINARYSECRET,
    secure: true
});


//  NEXT CHATGPT TO REMOVE  Set up multer storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cloudfolder', // Optional folder in your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png'] // Optional allowed formats for upload
    }
});



// NEXT CHATGPT Create multer instance with the configured storage

const upload = multer({ storage: storage });

// UPGRADED FOR MULTIPLE IMAGE UPLOAD -----------------------------

// router.post("/newprofile", upload.array("photos", 5), async (req, res) => {
//     try {
//         const uploadedImages = await Promise.all(
//             req.files.map(file => {
//                 return cloudinary.uploader.upload(file.path, { unique_filename: true });
//             })
//         );

//         const { fname, level, title, elitePass, availableDiamonds, totalWorth, sellPrice, accountEmailOrPhone, accountPassword, accountType, description } = req.body;

//         // Check if all required fields are provided
//         if (!fname || uploadedImages.length < 5 || !level || !title || !elitePass || !availableDiamonds || !totalWorth || !sellPrice || !accountEmailOrPhone || !accountPassword || !accountType || !description) {
//             return res.status(400).json({ status: 400, message: "Fill all the data and upload 5 photos" });
//         }

//         const id = Math.floor(100000 + Math.random() * 900000);
//         const date = moment(new Date()).format("YYYY-MM-DD");

//         const imgPaths = uploadedImages.map(image => image.secure_url);

//         const userdata = new uploadsSchema({
//             id: "account" + id,
//             fname: fname,
//             date: date,
//             level: level,
//             title: title,
//             elitePass: elitePass,
//             availableDiamonds: availableDiamonds,
//             totalWorth: totalWorth,
//             sellPrice: sellPrice,
//             accountEmailOrPhone: accountEmailOrPhone,
//             accountPassword: accountPassword,
//             accountType: accountType,
//             description: description,
//             imgpath1: imgPaths[0],
//             imgpath2: imgPaths[1],
//             imgpath3: imgPaths[2],
//             imgpath4: imgPaths[3],
//             imgpath5: imgPaths[4]
//         });

//         const finaldata = await userdata.save();

//         res.status(201).json({ status: 201, finaldata });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: 500, error: error.message });
//     }
// });

// router.post("/newprofile", upload.array("photos", 5), async (req, res) => {
//     // Access the Cloudinary URLs and public_ids of the uploaded images
//     const uploadedImages = req.files.map(file => {
//         return {
//             imgpath: file.secure_url,
//             public_id: file.public_id
//         };
//     });

//     const { fname, level, title, elitePass, availableDiamonds, totalWorth, sellPrice, accountEmailOrPhone, accountPassword, accountType, description } = req.body;

//     if (!fname || uploadedImages.length < 5 || !level || !title || !elitePass || !availableDiamonds || !totalWorth || !sellPrice || !accountEmailOrPhone || !accountPassword || !accountType || !description) {
//         res.status(401).json({ status: 401, message: "Fill all the data and upload 5 photos" });
//         return;
//     }

//     try {
//         const id = Math.floor(100000 + Math.random() * 900000);
//         const date = moment(new Date()).format("YYYY-MM-DD");

//         const userdata = new uploadsSchema({
//             id: "account" + id,
//             fname: fname,
//             imgpath1: uploadedImages[0].imgpath,
//             imgpath2: uploadedImages[1].imgpath,
//             imgpath3: uploadedImages[2].imgpath,
//             imgpath4: uploadedImages[3].imgpath,
//             imgpath5: uploadedImages[4].imgpath,
//             date: date,
//             level: level,
//             title: title,
//             elitePass: elitePass,
//             availableDiamonds: availableDiamonds,
//             totalWorth: totalWorth,
//             sellPrice: sellPrice,
//             accountEmailOrPhone: accountEmailOrPhone,
//             accountPassword: accountPassword,
//             accountType: accountType,
//             description: description,
//         });

//         const finaldata = await userdata.save();

//         res.status(201).json({ status: 201, finaldata });
//     } catch (error) {
//         res.status(401).json({ status: 401, error });
//     }
// });

// (Old) Free Fire Account [LIMITED OFFER]✅ Level 72,Like 12K+

router.post("/newprofile", upload.single("photo"), async (req, res) => {
    // Access the Cloudinary URL of the uploaded image
    const { filename, path } = req.file;
    const {
        fname,
        level,
        title,
        elitePass,
        likes,
        availableDiamonds,
        totalWorth,
        sellPrice,
        accountEmailOrPhone,
        accountPassword,
        accountType,
        description,
        paymentMethod,
        upiId,
        bankAccountNumber,
        ifscCode
    } = req.body;

    if (!fname || !filename || !level || !title || !elitePass || !likes || !availableDiamonds || !totalWorth || !sellPrice || !accountEmailOrPhone || !accountPassword || !accountType || !description || !paymentMethod) {
        res.status(401).json({ status: 401, message: "Fill all the data" });
        return;
    }

    try {
        const id = Math.floor(100000 + Math.random() * 900000);
        const date = moment(new Date()).format("YYYY-MM-DD");
        const uploadResult = await cloudinary.uploader.upload(path, { unique_filename: true });

        const userdata = new uploadsSchema({
            id: "account" + id,
            fname: fname,
            imgpath: uploadResult.secure_url,
            imgpath1: "https://res.cloudinary.com/dcefnlmn9/image/upload/v1691852688/s2z87518ctlmf2rqd3zg.jpg",
            imgpath2: "https://res.cloudinary.com/dcefnlmn9/image/upload/v1691852688/s2z87518ctlmf2rqd3zg.jpg",
            imgpath3: "https://res.cloudinary.com/dcefnlmn9/image/upload/v1691852688/s2z87518ctlmf2rqd3zg.jpg",
            imgpath4: "https://res.cloudinary.com/dcefnlmn9/image/upload/v1691852688/s2z87518ctlmf2rqd3zg.jpg",
            date: date,
            public_id: uploadResult.public_id,
            level: level,
            title: title,
            elitePass: elitePass,
            likes: likes,
            availableDiamonds: availableDiamonds,
            totalWorth: totalWorth,
            sellPrice: sellPrice,
            accountEmailOrPhone: accountEmailOrPhone,
            accountPassword: accountPassword,
            accountType: accountType,
            description: description,
            paymentMethod: paymentMethod,
            upiId: upiId,
            bankAccountNumber: bankAccountNumber,
            ifscCode: ifscCode
        });

        const finaldata = await userdata.save();

        res.status(201).json({ status: 201, finaldata });
    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
});



// The NEW FORM UPLOAD WITH CHATGPT ----------------------

// router.post("/newprofile", upload.single("photo"), async (req, res) => {
//     // Access the Cloudinary URL of the uploaded image
//     const { filename, path } = req.file;
//     const {
//         fname,
//         level,
//         title,
//         elitePass,
//         availableDiamonds,
//         totalWorth,
//         sellPrice,
//         accountEmailOrPhone,
//         accountPassword,
//         accountType,
//         description,
//         paymentMethod,
//         upiId,
//         bankAccountNumber,
//         ifscCode
//     } = req.body;

//     if (!fname || !filename || !level || !title || !elitePass || !availableDiamonds || !totalWorth || !sellPrice || !accountEmailOrPhone || !accountPassword || !accountType || !description || !paymentMethod) {
//         res.status(401).json({ status: 401, message: "Fill all the data" });
//         return;
//     }

//     try {

//         // const uploads = await uploadsSchema.find();z

//         const id = Math.floor(100000 + Math.random() * 900000);
//         const date = moment(new Date()).format("YYYY-MM-DD");
//         const uploadResult = await cloudinary.uploader.upload(path, { unique_filename: true });

//         const userdata = new uploadsSchema({
//             id: "account" + id,
//             fname: fname,
//             imgpath: uploadResult.secure_url,
//             date: date,
//             public_id: uploadResult.public_id,
//             level: level,
//             title: title,
//             elitePass: elitePass,
//             availableDiamonds: availableDiamonds,
//             totalWorth: totalWorth,
//             sellPrice: sellPrice,
//             accountEmailOrPhone: accountEmailOrPhone,
//             accountPassword: accountPassword,
//             accountType: accountType,
//             description: description,
//             paymentMethod: paymentMethod,
//             upiId: upiId,
//             bankAccountNumber: bankAccountNumber,
//             ifscCode: ifscCode
//         });

//         const finaldata = await userdata.save();

//         res.status(201).json({ status: 201, finaldata });
//     } catch (error) {
//         res.status(401).json({ status: 401, error });
//     }
// });


// router.post("addtrade/:id", authenticate, async (req, res) => {

//     try {
//         const { id } = req.params;

//         const trade = await uploadsSchema.findOne({ id: id });

//         const user = await logins.findOne({ _id: req.userID });

//         if (user) {
//             const tradeData = {
//                 id: trade.id,
//                 level: trade.level,
//                 title: trade.title,
//                 elitePass: trade.elitePass,
//                 availableDiamonds: trade.availableDiamonds,
//                 totalWorth: trade.totalWorth,
//                 sellPrice: trade.sellPrice,
//                 accountEmailOrPhone: trade.accountEmailOrPhone,
//                 accountPassword: trade.accountPassword,
//                 accountType: trade.accountType,
//                 description: trade.description,
//                 paymentMethod: trade.paymentMethod,
//                 upiId: trade.upiId,
//                 bankAccountNumber: trade.bankAccountNumber,
//                 ifscCode: trade.ifscCode
//             };

//             // Add tradeData to user's trade array and save the document
//             user.trades.push(tradeData);
//             await user.save();

//             res.status(201).json(user);
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// })


// Post the Form for SELL API...

router.post('/api/submit', async (req, res) => {
    try {
        // Create a new instance of the Form model with the submitted data
        const form = new Form(req.body);

        // Save the form data to the database
        const savedForm = await form.save();

        res.status(201).json(savedForm); // Respond with the saved form data
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while saving the form data.' });
    }
});


// get banner imagesdata api

router.get('/api/images', async (req, res) => {
    try {
        const imagesdata = await Images.find();
        res.json(imagesdata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// // get productsdata API
// router.get("/getproducts", async (req, res) => {
//     try {
//         const productsdata = await Products.find();
//         //console.log("console the data" + productsdata);
//         res.status(201).json(productsdata);
//     } catch (error) {
//         console.log("error" + error.message);
//     }
// });


// register data

// router.post("/register", async (req, res) => {
//     //console.log(req.body)      ==this console.log use for console the data from the API call, this data will not show on the MONGODB Databases.

//     const { fname, email, mobile, password, cpassword } = req.body;

//     if (!fname || !email || !mobile || !password || !cpassword) {
//         res.status(422).json({ error: "fill the all data" });
//         console.log("not data available");
//     };

//     try {
//         const preuser = await logins.findOne({ email: email });

//         if (preuser) {
//             res.status(422).json({ error: "this user is already exist" })
//         } else if (password !== cpassword) {
//             res.status(422).json({ error: "password and cpassword not match" })
//         } else {
//             const finalUser = new logins({
//                 fname, email, mobile, password, cpassword
//             });

//             const storedata = await finalUser.save();
//             console.log(storedata);

//             res.status(201).json(storedata);
//         }
//     } catch (error) {

//     }
// });

// This is code is forward to TOP =================

// router.post("/register", async (req, res) => {
//     try {
//       const { fname, email, mobile, password, cpassword } = req.body;

//       if (!fname || !email || !mobile || !password || !cpassword) {
//         return res.status(422).json({ error: "Fill in all the required fields" });
//       }

//       const preuser = await logins.findOne({ email: email });

//       if (preuser) {
//         return res.status(422).json({ error: "This user already exists" });
//       } else if (password !== cpassword) {
//         return res.status(422).json({ error: "Passwords do not match" });
//       } else {
//         const finalUser = new logins({
//           fname,
//           email,
//           mobile,
//           password,
//           cpassword,
//         });

//         const storedata = await finalUser.save();

//         // Assign a redeem code to the user
//         const assignedRedeemCode = await assignRedeemCodeToUser(user._id);

//         res.json({
//             success: true,
//             redeemCode: assignedRedeemCode
//         });

//         res.status(201).json(storedata);
//       }
//     } catch (error) {
//       console.error('Error registering user:', error);
//       res.status(500).json({ error: "Failed to register user" });
//     }
//   });



// Login user API

router.post("/login", async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        res.status(400).json({ error: "fill all the data" })
    };

    try {
        const userlogin = await logins.findOne({ mobile: mobile });
        console.log(userlogin + "user value");

        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            // const isMatch = await (password, userlogin.password);
            console.log(isMatch + "password matched...");

            if (!isMatch) {
                res.status(400).json({ error: "invalid details and password" })
            } else {
                // token generate
                const token = await userlogin.generateAuthtoken();
                console.log(token + "THIS IS TOKEN VALUE OF JWT");

                res.cookie("ffidtradecookie", token, {
                    expires: new Date(Date.now() + 90000000000),
                    httpOnly: true
                })

                res.status(201).json(userlogin)
            }
        } else {
            res.status(400).json({ error: "invalid password" });
        }
    } catch (error) {
        res.status(400).json({ error: "invalid details" })
    }
})


// adding the data into cart
router.post("/addcart/:id", authenticate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await uploadsSchema.findOne({ id: id });
        console.log(cart + "cart milta hain");

        const Usercontact = await logins.findOne({ _id: req.userID });
        console.log(Usercontact + "user milta hain");


        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            console.log(cartData + " thse save wait kr");
            console.log(Usercontact + "userjode save");
            res.status(201).json(Usercontact);
        }
    } catch (error) {
        console.log(error);
    }
});


router.post("/addorder/:id", authenticate, async (req, res) => {

    try {
        const { id } = req.params;
        // console.log("perfect 6");
        const order = await OrderNewHistory.findOne({ orderId: id });

        const Usercontact = await logins.findOne({ _id: req.userID });

        if (Usercontact) {
            // Assuming you want to store specific fields from the order object
            const orderData = {
                productId: order.productId,
                orderId: order.orderId,
                amount: order.amount,
                currency: order.currency,
                email: order.email,
                contact: order.contact,
                accountEmailOrPhone: order.accountEmailOrPhone,
                account: order.account,
                timestamp: new Date(),
            };

            // Create a new instance of OrderNewHistory
            const newOrder = new OrderNewHistory(orderData);

            // Save the new order to the database
            await newOrder.save();

            // Update the user's orders array and save the document
            Usercontact.orders.push(newOrder);
            await Usercontact.save();

            res.status(201).json(Usercontact);
        }
    } catch (error) {
        console.log(error);
    }
});


// In this ----------------


// Get Order details
router.get("/orderdetails", authenticate, async (req, res) => {
    try {
        const orderuser = await logins.findOne({ _id: req.userID });
        res.status(201).json(orderuser);
    } catch (error) {
        console.log("error" + error)
    }
});


router.post("/addtrade/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const trade = await uploadsSchema.findOne({ id: id });

        const user = await logins.findOne({ _id: req.userID });

        if (user) {
            const tradeData = {
                id: trade.id,
                level: trade.level,
                title: trade.title,
                elitePass: trade.elitePass,
                availableDiamonds: trade.availableDiamonds,
                totalWorth: trade.totalWorth,
                sellPrice: trade.sellPrice,
                accountEmailOrPhone: trade.accountEmailOrPhone,
                accountPassword: trade.accountPassword,
                accountType: trade.accountType,
                description: trade.description,
                paymentMethod: trade.paymentMethod,
                upiId: trade.upiId,
                bankAccountNumber: trade.bankAccountNumber,
                ifscCode: trade.ifscCode
            };

            // Add tradeData to user's trade array and save the document
            user.trades.push(tradeData);
            await user.save();

            res.status(201).json(user);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.get("/tradedetails", authenticate, async (req, res) => {
    try {
        const tradeuser = await logins.findOne({ _id: req.userID });
        res.status(201).json(tradeuser);
    } catch (error) {
        console.log("error" + error);
    }
})


// Get cart details
router.get("/cartdetails", authenticate, async (req, res) => {
    try {
        const buyuser = await logins.findOne({ _id: req.userID });
        res.status(201).json(buyuser);
    } catch (error) {
        console.log("error" + error)
    }
});


// remove item from cart
router.delete("/remove/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((cruval) => {
            return cruval.id != id;
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("item removed");
    } catch (error) {
        console.log("error" + error);
        res.status(400).json(req.rootUser);
    }
})


// get valid user

router.get("/validuser", authenticate, async (req, res) => {
    try {
        const validuser = await logins.findOne({ _id: req.userID });
        res.status(201).json(validuser);
    } catch (error) {
        console.log("error" + error)
    }
})





// token1, token2, token3, token4

// for user Logout
router.get("/logout", authenticate, (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((currElem) => {
            return currElem.token !== req.token
        });

        res.clearCookie("ffidtradecookie", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user Logout");
    } catch (error) {
        // res.status(01).json(req.rootUser.tokens);
        console.log("error for user Logout");
    }
})



// router.post("addtrade/:id", authenticate, async (req, res) => {

//     try {
//         const { id } = req.params;

//         const trade = await uploadsSchema.findOne({ id: id });

//         const Usercontact = await logins.findOne({ _id: req.userID });

//         if (Usercontact) {
//             const tradeData = {
//                 id: trade.id,
//                 fname: trade.fname,
//                 imgpath: trade.imgpath,
//                 date: trade.date,
//                 public_id: trade.public_id,
//                 level: trade.level,
//                 title: trade.title,
//                 elitePass: trade.elitePass,
//                 availableDiamonds: trade.availableDiamonds,
//                 totalWorth: trade.totalWorth,
//                 sellPrice: trade.sellPrice,
//                 accountEmailOrPhone: trade.accountEmailOrPhone,
//                 accountPassword: trade.accountPassword,
//                 accountType: trade.accountType,
//                 description: trade.description,
//                 paymentMethod: trade.paymentMethod,
//                 upiId: trade.upiId,
//                 bankAccountNumber: trade.bankAccountNumber,
//                 ifscCode: trade.ifscCode
//             };

//             // Crate a new instance of TradeHistory
//             const newTrade = new uploadsSchema(tradeData);

//             // Save the new Trade to the Database
//             await newTrade.save();

//             // Update the User's trades array and save the document
//             Usercontact.trades.push(newTrade);
//             await Usercontact.save();

//             res.status(201).json(Usercontact);
//         }
//     } catch (error) {
//         console.log(error);
//     }
// })

module.exports = router;