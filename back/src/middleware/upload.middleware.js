import multer from "multer";

const MAX_FILE_SIZE = 48 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },

  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const isAudio = file.mimetype.startsWith("audio/");
    const isVoiceNote =
      file.originalname && file.originalname.toLowerCase().startsWith("voice_");

    if (!isImage && !isVideo && !isAudio && !isVoiceNote) {
      return cb(new Error("Only image, video, and audio uploads are allowed"));
    }

    cb(null, true);
  },
});
