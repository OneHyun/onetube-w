import express from "express";
import {
  logout,
  getEditProfile,
  postEditProfile,
  getChangePassword,
  postChangePassword,
  see,
  startGithubLogin,
  finishGithubLogin,
  startKakaoLogin,
  finishKakaoLogin,
} from "../controllers/userController";
import {
  avatarUpload,
  protectMiddleware,
  publicOnlyMiddleware,
} from "../middlewares";
const userRouter = express.Router();

userRouter.get("/logout", protectMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectMiddleware)
  .get(getEditProfile)
  .post(avatarUpload.single("avatar"), postEditProfile);

userRouter
  .route("/change_password")
  .all(protectMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);

userRouter.get("/:id([0-9a-f]{24})", see);

userRouter.use(
  function (err, req, res, next) {
    if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "사이즈가 너무 큰 파일입니다.");
      return res.redirect("/");
    }
    next();
  }

  // Handle any other errors
);
export default userRouter;
