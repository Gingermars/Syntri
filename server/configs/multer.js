import multer from "multer";

// Use memory storage for Vercel compatibility
export const upload = multer({ storage: multer.memoryStorage() });
