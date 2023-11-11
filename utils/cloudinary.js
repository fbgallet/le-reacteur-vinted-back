const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convert");
require("dotenv").config();

console.log(process.env.CLOUDINARY_API_KEY);

cloudinary.config({
  cloud_name: "dzfqscodm",
  api_key: "316947199737386",
  api_secret: process.env.CLOUDINARY_API_KEY,
});

const uploadToCloudinaryAndGetUrl = async (buffer, options) => {
  const result = await cloudinary.uploader.upload(
    convertToBase64(buffer),
    options
  );
  console.log("File uploaded:", result);
  return result;
};

module.exports = uploadToCloudinaryAndGetUrl;
