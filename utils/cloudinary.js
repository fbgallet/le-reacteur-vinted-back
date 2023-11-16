const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convert");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.COUDINARY_PUBLIC_API,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
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
