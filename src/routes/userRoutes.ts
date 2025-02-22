import { Router } from "express";
import userController from "../controllers/userController";
import { authenticate, checkType } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/signup", userController.createUser);
router.post("/login", userController.login);
router.get("/", authenticate, checkType("admin"), userController.getAllUsers);
router.get("/:id", authenticate, userController.getSingleUser);
router.put("/:id", authenticate, userController.updateSingleUser);
router.delete("/:id", authenticate, userController.deleteUser);

export default router;


