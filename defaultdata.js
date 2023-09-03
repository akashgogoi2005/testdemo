// const Products = require("./models/productsSchema");
// const productsdata = require("./constant/productsdata");
const imagesdata = require("./constant/imagesdata");
const Images = require("./models/imagesSchema");
// const RedeemCode = require('./models/redeemCodeSchema');



// const expirationDate = new Date();
// expirationDate.setHours(expirationDate.getHours() + 24);
// const expirationDate2 = new Date();
// expirationDate.setHours(expirationDate.getHours() + 1);

// // Create an array of Redeem codes
// const redeemCodes = [
//     { code: 'LHVL4LFH30SSLKLS', expired: false, expireAt: expirationDate2 },
//     { code: 'SHVL4LFH3TSHLKLS', expired: false, expireAt: expirationDate },
//     { code: 'MHVL4LFH3GSHLKLS', expired: false, expireAt: expirationDate },
//     { code: 'WHVS4LFH3SSHLKLS', expired: false, expireAt: expirationDate },
//     { code: 'PHVL4LFH3LSHLKLS', expired: false, expireAt: expirationDate },
//     { code: 'PHVL4LFH3LSHLTPL', expired: false, expireAt: expirationDate },
//     { code: 'PHVL4LFH3LSHLKCS', expired: false, expireAt: expirationDate },
//   ];

const DefaultData = async () => {
    try {

        // await Products.deleteMany({});
        await Images.deleteMany({});


        // const storeData = await Products.insertMany(productsdata);
        const storeImages = await Images.insertMany(imagesdata);
        // console.log(storeData);
        console.log("FFIDTRADE.com" + storeImages);
    } catch (error) {
        console.log("error" + error.message);
    }

    // // Remove duplicates from the redeemCodes array
    // const uniqueRedeemCodes = Array.from(new Set(redeemCodes.map((code) => code.code)))
    //     .map((code) => redeemCodes.find((redeemCode) => redeemCode.code === code));

    // await RedeemCode.deleteMany({});
    // // Save the unique redeem codes to the database
    // RedeemCode.insertMany(uniqueRedeemCodes)
    //     .then(() => {
    //         console.log('Redeem codes saved successfully');
    //     })
    //     .catch((error) => {
    //         console.error('Error saving redeem codes:', error);
    //     });
}

module.exports = DefaultData;