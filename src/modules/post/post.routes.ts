import { Router } from "express";
import { PostController } from "./post.controller.js";
import { PostValidation } from "./post.validation.js";
import { authentication } from "../../common/middleware/auth.middleware.js";

const postRouter = Router();

// Public
postRouter.get("/", PostController.getAllPosts);

// Must be declared before "/:id"
postRouter.get("/feed", authentication, PostController.getFeed);

postRouter.get("/:id", PostController.getPostById);

// Protected
postRouter.post("/", authentication, PostValidation.validateCreatePost, PostController.createPost);
postRouter.patch("/:id", authentication, PostValidation.validateUpdatePost, PostController.updatePost);
postRouter.delete("/:id", authentication, PostController.deletePost);

postRouter.patch("/:id/like", authentication, PostController.toggleLike);

postRouter.post("/:id/comments", authentication, PostValidation.validateAddComment, PostController.addComment);
postRouter.delete("/:id/comments/:commentId", authentication, PostController.deleteComment);

export default postRouter;
