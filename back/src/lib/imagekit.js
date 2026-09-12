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
    process.env.IMAGEKIT_URL_ENDPOINT,
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
