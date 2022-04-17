let videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 1,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 12,
    id: 3,
  },
];

export const trending = (req, res) =>
  res.render("home", { pageTitle: "Home", videos });
export const watch = (req, res) => {
  const { id } = req.params;
  const currentVideo = videos[id - 1];
  res.render("watch", {
    pageTitle: `Watching ${currentVideo.title}`,
    video: currentVideo,
  });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  const currentVideo = videos[id - 1];
  res.render("edit", {
    pageTitle: `Editing ${currentVideo.title}`,
    video: currentVideo,
  });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  res.render("upload", {
    pageTitle: "New Video Upload",
  });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  videos.push({
    title,
    rating: 0,
    comments: 0,
    createdAt: "just now",
    views: 0,
    id: videos.length + 1,
  });
  console.log(videos);
  // will add a video to videos array
  return res.redirect("/");
};
