import express from "express";
import {
  createComment,
  deleteComment,
  registerView,
  updownRecommand,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/comments/:id([0-9a-f]{24})", createComment);
apiRouter.post("/comments/:id([0-9a-f]{24})/delete", deleteComment);
apiRouter.post("/ratings/:id([0-9a-f]{24})", updownRecommand);
export default apiRouter;
