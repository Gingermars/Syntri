import express from "express";
import { auth } from "../middleware/auth.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  reviewResume,
} from "../controllers/aiController.js";
import multer from "multer";

const aiRouter = express.Router();
const upload = multer({ dest: "uploads/" });

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);
aiRouter.post(
  "/remove-background",
  auth,
  upload.single("image"),
  removeImageBackground,
);
aiRouter.post(
  "/remove-object",
  auth,
  upload.single("image"),
  removeImageObject,
);
aiRouter.post("/review-resume", auth, upload.single("resume"), reviewResume);

export default aiRouter;
