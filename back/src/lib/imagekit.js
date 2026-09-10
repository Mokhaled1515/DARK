// // import ImageKit, { toFile } from "@imagekit/nodejs";

// // const imageKit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

// // function hasImageKitConfig(){
// //     return Boolean(process.env.IMAGEKIT_PRIVATE_KEY)
// // }

// // function createFileName(originalName = "upload"){
// //     const saveName = originalName.replace(/[^a-zA-Z0-9._-]/9,"_");
// //     return `chat-${Date.now()}-${saveName}`
// // }

// // async function uploadChatMedia(file){
// //     const fileName = createFileName(file.originalName);
// //     const result = await imageKit.files.upload({
// //         file: await toFile(file.buffer, fileName,{type:file.mimetype}),
// //         fileName,
// //         folder: "/chat"
// //     })
// // }

// import ImageKit, { toFile } from "@imagekit/nodejs";

// const imagekit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

// function hasImageKitConfig() {
//   return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
// }

// // originalName= "My Photo (1).png"
// // result: "chat-1749300000000-My_Photo__1_.png"
// // this helper makes a safe, unique filename for uploaded files.
// function createFileName(originalName = "upload") {
//   const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
//   return `chat-${Date.now()}-${safeName}`;
// }

// /**
//  * Upload image or video to ImageKit
//  * @see https://imagekit.io/docs/api-reference/upload-file/upload-file
//  */
// async function uploadChatMedia(file) {
//   const fileName = createFileName(file.originalname);

//   const result = await imagekit.files.upload({
//     file: await toFile(file.buffer, fileName, { type: file.mimetype }),
//     fileName,
//     folder: "/chat",
//   });

//   return result.url;
// }

// export { uploadChatMedia, hasImageKitConfig };

// import ImageKit, { toFile } from "@imagekit/nodejs";

// const imagekit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

// function hasImageKitConfig() {
//   return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
// }

// // helper makes a safe, unique filename for uploaded files.
// function createFileName(originalName = "upload") {
//   const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
//   return `chat-${Date.now()}-${safeName}`;
// }

// /**
//  * Upload image, video, or audio to ImageKit
//  * @see https://imagekit.io/docs/api-reference/upload-file/upload-file
//  */
// async function uploadChatMedia(file) {
//   // 👈 تعديل الكلمة لـ originalname بدلاً من originalName
//   const fileName = createFileName(file.originalname);

//   // تحديد نوع الملف لـ ImageKit
//   let fileType = "image";
//   if (file.mimetype.startsWith("video/")) {
//     fileType = "video";
//   } else if (file.mimetype.startsWith("audio/")) {
//     fileType = "non-image"; // ImageKit يتعامل مع الملفات الصوتية كـ non-image
//   }

//   const result = await imagekit.files.upload({
//     file: await toFile(file.buffer, fileName, { type: file.mimetype }),
//     fileName,
//     folder: "/chat",
//     fileType, // 👈 التحديد الصريح لضمان عدم حدوث Processing Error
//   });

//   return result.url;
// }

// export { uploadChatMedia, hasImageKitConfig };

// import ImageKit from "imagekit";

// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
// });

// function hasImageKitConfig() {
//   return Boolean(
//     process.env.IMAGEKIT_PRIVATE_KEY &&
//     process.env.IMAGEKIT_PUBLIC_KEY &&
//     process.env.IMAGEKIT_URL_ENDPOINT,
//   );
// }

// function createFileName(originalName = "recording.webm") {
//   const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
//   return `chat-${Date.now()}-${safeName}`;
// }

// async function uploadChatMedia(file) {
//   const fileName = createFileName(file.originalname);

//   // تحويل الـ Buffer إلى Base64 لضمان سلامة نقل الصوت بدون تلف
//   const fileBase64 = file.buffer.toString("base64");

//   const result = await imagekit.upload({
//     file: fileBase64, // إرسال Base64 مباشرة
//     fileName: fileName,
//     folder: "/chat",
//     useUniqueFileName: true,
//   });

//   return result.url; // بيرجع رابط الصوت المرفوع جاهز للعمل
// }

// export { uploadChatMedia, hasImageKitConfig };

// import ImageKit from "imagekit";

// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
// });

// function hasImageKitConfig() {
//   return Boolean(
//     process.env.IMAGEKIT_PRIVATE_KEY &&
//     process.env.IMAGEKIT_PUBLIC_KEY &&
//     process.env.IMAGEKIT_URL_ENDPOINT
//   );
// }

// function createFileName(originalName = "recording.webm") {
//   const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
//   return `chat-${Date.now()}-${safeName}`;
// }

// /**
//  * Upload image, video, or audio to ImageKit
//  */
// async function uploadChatMedia(file) {
//   try {
//     const fileName = createFileName(file.originalname);

//     // تحويل الـ Buffer القادم من Multer إلى Base64 String
//     const fileBase64 = file.buffer.toString("base64");

//     // الرفع المباشر المعتمد في ImageKit
//     const result = await imagekit.upload({
//       file: fileBase64,
//       fileName: fileName,
//       folder: "/chat",
//       useUniqueFileName: true,
//     });

//     return result.url; // يرجع رابط URL شغال تماماً
//   } catch (error) {
//     console.error("ImageKit Upload Error:", error);
//     throw error;
//   }
// }

// export { uploadChatMedia, hasImageKitConfig };





// import ImageKit from "imagekit";
// import dotenv from "dotenv";

// dotenv.config();

// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
// });

// function hasImageKitConfig() {
//   return Boolean(
//     process.env.IMAGEKIT_PRIVATE_KEY &&
//     process.env.IMAGEKIT_PUBLIC_KEY &&
//     process.env.IMAGEKIT_URL_ENDPOINT,
//   );
// }

// function createFileName(originalName = "recording.webm") {
//   const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
//   return `chat-${Date.now()}-${safeName}`;
// }

// async function uploadChatMedia(file) {
//   try {
//     const fileName = createFileName(file.originalname);
//     const fileBase64 = file.buffer.toString("base64");

//     const result = await imagekit.upload({
//       file: fileBase64,
//       fileName: fileName,
//       folder: "/chat",
//       useUniqueFileName: true,
//     });

//     return result.url;
//   } catch (error) {
//     console.error("ImageKit Upload Error:", error);
//     throw error;
//   }
// }

// export { uploadChatMedia, hasImageKitConfig };





import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function hasImageKitConfig() {
  return Boolean(
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}

function createFileName(originalName = "recording.webm") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

async function uploadChatMedia(file) {
  try {
    const fileName = createFileName(file?.originalname);
    const fileBase64 = file.buffer.toString("base64");

    const result = await imagekit.upload({
      file: fileBase64,
      fileName: fileName,
      folder: "/chat",
      useUniqueFileName: true,
    });

    return result.url;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw error;
  }
}

export { uploadChatMedia, hasImageKitConfig };