import videoModel from "../models/video";
import userModel from "../models/user";
import commentModel from "../models/comment";

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
    .populate("comments");
  if (!video)
    return res.status(404).render("404", { pageTitle: "Video Not Found." });

  const uploadedTime = timeSince(video.createdAt) + " 전";
  return res.render("watch", {
    pageTitle: video.title,
    video,
    uploadedTime,
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
  if (!video)
    return res.status(404).render("404", { pageTitle: "Video Not Found." });

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
    return res.status(404).render("404", { pageTitle: "Video not found." });
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
  console.log(video, thumb);
  try {
    const newVideo = await videoModel.create({
      title,
      description,
      fileUrl: videoModel.changePathFormula(video[0].path),
      thumbUrl: videoModel.changePathFormula(thumb[0].path),
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
    return res
      .status(404)
      .render("404", { pageTitle: "업로드된 비디오가 없습니다." });
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
