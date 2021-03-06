import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { imageUpload, protectMiddleware, videoUpload } from "../middlewares";
const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectMiddleware)
  .get(deleteVideo);

/* Same Result  
videoRouter.get("/:id(\\d+)/edit", getEdit);
videoRouter.post("/:id(\\d+)/edit", postEdit); */
videoRouter
  .route("/upload")
  .all(protectMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

videoRouter.use(
  function (err, req, res, next) {
    if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "사이즈가 너무 큰 파일입니다.");
      return res.redirect("/");
    }
    next();
  }

  // Handle any other errors
);
export default videoRouter;
