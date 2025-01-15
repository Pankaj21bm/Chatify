import express from "express";
import {
  registerUser,
  authUser,
  allUsers,
  renameName,
  updatePicture
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", registerUser);
router.get("/", protect, allUsers);
router.post("/login", authUser);
router.route("/updatename").put(protect, renameName);
router.route("/updatepicture").put(protect, updatePicture);
export default router;
