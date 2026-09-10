import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * دالة عامة لرفع أي ملف (صوت، صورة، فيديو) إلى Cloudinary
 * @param {Buffer} fileBuffer - بوفر الملف القادم من Multer
 * @param {string} folderName - اسم المجلد في Cloudinary
 * @returns {Promise<string>} - ينتهي بـ secure_url للملف المرفوع
 */
export const uploadChatMedia = (fileBuffer, folderName = "chat_media") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto", // 👈 يتعرف تلقائياً على الصوت، الفيديو، والصور
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};