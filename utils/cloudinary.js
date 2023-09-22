const cloudinary = require("../config/cloudinary");

const uploadImage = async (image, folder, name) => {
  const result = await cloudinary.uploader.unsigned_upload(
    image,
    "stream-pool",
    {
      folder: `stream_pool/${folder}`,
      filename_override: name,
    }
  );

  return result;
};

const removeImage = async (imageId) => {
  const result = await cloudinary.uploader.destroy(imageId);
  return result;
};

module.exports = {
  uploadImage,
  removeImage,
};
