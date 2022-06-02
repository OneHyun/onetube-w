import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "onetube-w",
  acl: "public-read",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "OneTube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "로그인이 필요합니다.");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "비정상적인 접근 경로입니다.");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  fileFilter: function (req, file, cb) {
    if (file.mimetype.includes("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  dest: "uploads/avatars/",
  //Byte
  limits: { fileSize: 3000000 },
  storage: multerUploader,
});

export const videoUpload = multer({
  fileFilter: function (req, file, cb) {
    if (
      (file.fieldname === "video" && file.mimetype.includes("video/")) ||
      (file.fieldname === "thumb" && file.mimetype.includes("image/"))
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  dest: "uploads/videos/",
  //Byte
  limits: { fileSize: 10000000 },
  storage: multerUploader,
});
