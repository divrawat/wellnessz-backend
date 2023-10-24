import express from "express";
const router = express.Router();
import { requireSignin, authMiddleware, adminMiddleware } from "../controllers/auth.js";
import { read, publicProfile, update, photo } from "../controllers/user.js";

router.get('/user/profile', requireSignin, adminMiddleware, read);
router.get('/user/:username', publicProfile);
router.put('/user/update', requireSignin, adminMiddleware, update);
router.get('/user/photo/:username', photo);

export default router