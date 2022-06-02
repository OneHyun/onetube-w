import videoModel from "../models/video";
import userModel from "../models/user";
import commentModel from "../models/comment";
import { async } from "regenerator-runtime";

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "년";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "달";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "일";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "시간";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "분";
  }
  return Math.floor(seconds) + "초";
}

export const home = async (req, res) => {
  try {
    const videos = await videoModel
      .find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    return res.render("server-error", { error });
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel
    .findById(id)
    .populate("owner")
    .populate("comments")
    .populate("comments.owner");

  if (!video) {
    req.flash("error", "해당 비디오를 찾을 수 없습니다.");
    return res.status(404).redirect("/");
  }

  const uploadedTime = timeSince(video.createdAt) + " 전";
  const printUploadedDay = new Date(video.createdAt)
    .toLocaleDateString("ko-kr")
    .replaceAll(" ", "");

  let alreadyRecommand = false;
  if (req.session.user) {
    alreadyRecommand = video.meta.rating.user.includes(req.session.user._id);
  }
  let hashtags = "";
  video.hashtags.forEach((element) => {
    hashtags += String(element) + " ";
  });

  let comments = [];
  let count = 0;
  for (const item of video.comments.reverse()) {
    count += 1;
    const comment = await commentModel.findById(item.id).populate("owner");
    comments.push({
      id: comment.id,
      text: comment.text,
      username: comment.owner.username,
      owner_id: comment.owner._id,
      createdAt: new Date(comment.createdAt)
        .toLocaleDateString("ko-kr")
        .replaceAll(" ", ""),
    });
    if (count >= 25) {
      break;
    }
  }

  return res.render("watch", {
    pageTitle: video.title,
    video,
    uploadedTime,
    printUploadedDay,
    alreadyRecommand,
    hashtags,
    comments,
  });
};

export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await videoModel.findById(id);
  if (!video) {
    req.flash("error", "해당 비디오를 찾을 수 없습니다.");
    return res.status(404).redirect("/");
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "비정상적인 접근 경로입니다.");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const { title, description, hashtags } = req.body;

  const video = await videoModel.findById(id);
  if (!video) {
    req.flash("error", "해당 비디오를 찾을 수 없습니다.");
    return res.status(404).redirect("/");
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "변경 권한이 존재하지 않습니다.");
    return res.status(403).redirect("/");
  }

  await videoModel.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: videoModel.formatHashtags(hashtags),
  });

  req.flash("success", "변경이 완료되었습니다.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "New Video Upload" });
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, description, hashtags },
    files: { video, thumb },
  } = req;

  try {
    const isHeroku = process.env.NODE_ENV === "production";
    const newVideo = await videoModel.create({
      title,
      description,
      fileUrl: isHeroku
        ? videoModel.changePathFormula(video[0].location)
        : `/${videoModel.changePathFormula(video[0].path)}`,
      thumbUrl: isHeroku
        ? videoModel.changePathFormula(thumb[0].location)
        : `/${videoModel.changePathFormula(thumb[0].path)}`,
      owner: _id,
      hashtags: videoModel.formatHashtags(hashtags),
    });
    const user = await userModel.findById(_id);
    user.videos.unshift(newVideo._id);
    user.save();

    return res.redirect("/");
  } catch (error) {
    return res.render("upload", {
      pageTitle: "New Video Upload",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await videoModel.findById(id);
  if (!video) {
    req.flash("error", "업로드된 비디오가 없습니다.");
    return res.status(404).redirect("/");
  }

  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  await videoModel.findByIdAndDelete(id);
  const user = await userModel.findById(_id);

  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await videoModel
      .find({
        title: { $regex: new RegExp(keyword, "i") },
      })
      .sort({ createdAt: "desc" })
      .populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await videoModel.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await commentModel.create({
    text,
    owner: user._id,
    video: id,
  });

  video.comments.push(comment._id);
  video.save();

  const mongoUser = await userModel.findById(user._id);
  mongoUser.comments.push(comment._id);

  mongoUser.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const comment = await commentModel.findById(id).populate("owner");
  if (!comment) {
    return res.sendStatus(404);
  }

  if (String(comment.owner.id) !== String(_id)) {
    return res.sendStatus(403);
  }

  await commentModel.findByIdAndDelete(id);
  const user = await userModel.findById(_id);
  user.comments.splice(user.comments.indexOf(id), 1);
  user.save();

  return res.sendStatus(201);
};

export const updownRecommand = async (req, res) => {
  const { id } = req.params;
  if (!req.session.user) {
    return res.sendStatus(403);
  }
  const {
    user: { _id },
  } = req.session;

  const video = await videoModel.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  const alreadyRecommand = video.meta.rating.user.includes(_id);
  if (alreadyRecommand) {
    video.meta.rating.count -= 1;
    video.meta.rating.user.splice(video.meta.rating.user.indexOf(_id), 1);
    await video.save();

    const user = await userModel.findById(_id);
    user.ratings.splice(user.ratings.indexOf(id), 1);
    await user.save();
  } else {
    video.meta.rating.count += 1;
    video.meta.rating.user.push(_id);
    await video.save();

    const user = await userModel.findById(_id);
    user.ratings.push(id);
    await user.save();
  }

  return res
    .status(201)
    .json({ isCancel: alreadyRecommand, count: video.meta.rating.count });
};
