import { Router } from "express";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";
import { authentication } from "../../common/middleware/auth.middleware.js";

const userRouter = Router();

// ---- Logged-in user ("me") ----  (must come before "/:id")
userRouter.get("/profile", authentication, UserController.getMyProfile);
userRouter.patch("/profile", authentication, UserValidation.validateUpdateProfile, UserController.updateMyProfile);
userRouter.patch("/profile/password", authentication, UserValidation.validateChangePassword, UserController.changePassword);
userRouter.delete("/profile", authentication, UserController.deleteMyAccount);

// ---- Other users ----
userRouter.get("/:id", UserController.getUserById);
userRouter.get("/:id/posts", UserController.getUserPosts);
userRouter.get("/:id/followers", UserController.getFollowers);
userRouter.get("/:id/following", UserController.getFollowing);
userRouter.patch("/:id/follow", authentication, UserController.follow);
userRouter.patch("/:id/unfollow", authentication, UserController.unfollow);

export default userRouter;
