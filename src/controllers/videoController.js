import videoModel from "../models/video";
import userModel from "../models/user";
/* //example of using callback method
  videoModel.find({}, (error, videos) => {
    if (error) {
      return res.render("server-error");
    }
    return res.render("home", { pageTitle: "Home", videos });
  }); 
*/
export const home = async (req, res) => {
  try {
    const videos = await videoModel.find({}).sort({ createdAt: "desc" });
    return res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    return res.render("server-error", { error });
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel.findById(id).populate("owner");
  if (!video)
    return res.status(404).render("404", { pageTitle: "Video Not Found." });

  return res.render("watch", {
    pageTitle: video.title,
    video,
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
    return res.status(403).redirect("/");
  }

  await videoModel.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: videoModel.formatHashtags(hashtags),
  });
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
    file: { path: fileUrl },
  } = req;
  try {
    const newVideo = await videoModel.create({
      title,
      description,
      fileUrl,
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
    return res.status(404).render("404", { pageTitle: "Video not found." });
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
      .sort({ createdAt: "desc" });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
