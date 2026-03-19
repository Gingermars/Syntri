import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getUserCreations,
  getPublishedCreations,
  toggleLikeCreations,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/get-user-creations", auth, getUserCreations);
userRouter.get("/get-published-creations", getPublishedCreations);
userRouter.post("/toggle-like-creation", auth, toggleLikeCreations);

export default userRouter;
