const video = document.querySelector("video");
const videoBox = document.querySelector(".videoBox");

const play = document.getElementById("play");
const playIcon = play.querySelector("i");
const mute = document.getElementById("mute");
const muteIcon = mute.querySelector("i");
const fullScreen = document.getElementById("fullScreen");
const fullScreenIcon = fullScreen.querySelector("i");
const volume = document.getElementById("volume");
const timeline = document.getElementById("timeline");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

const commentInput = document.querySelector("#input-comment");
const searchInput = document.querySelector("#search-comment");

const videoShareIcon = document.getElementById("video__share--icon");
const shareSign = document.getElementById("video__data--info-share");
const VIEW_SIGN = "load_sign";

let volumeValue = 0.5;
video.volume = volumeValue;
let isVideoPaused = true;
let controlsTimeout = null;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volume.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;

  volumeValue = value;

  if (video.muted) {
    video.muted = false;
  } else if (Number(value) === 0) {
    video.muted = true;
    volumeValue = 0.1;
  }

  muteIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  video.volume = volumeValue;
};

const formatTime = (seconds) => {
  const startIdx = seconds >= 3600 ? 11 : 14;
  return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
};
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
  if (video.readyState == 4) {
    handlePlayClick();
  }
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = video.currentTime;
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
  playIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};
const handleTimelineMousedown = () => {
  isVideoPaused = video.paused;
  isVideoPaused ? "" : video.pause();
};
const handleTimelineMouseup = () => {
  !isVideoPaused ? video.play() : "";
};

const handleFullscreenClick = () => {
  const fullScreenStatus = document.fullscreenElement;
  fullScreenStatus
    ? document.exitFullscreen()
    : videoContainer.requestFullscreen();
};
const handleFullscreenChange = () => {
  const fullScreenStatus = document.fullscreenElement;
  fullScreenStatus
    ? (fullScreenIcon.classList = "fas fa-compress")
    : (fullScreenIcon.classList = "fas fa-expand");
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("mouseon_video");

  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("mouseon_video");
  }, 5000);
};
const handleMouseLeave = () => {
  videoControls.classList.remove("mouseon_video");
};

const handleKeyInput = (e) => {
  if (
    (commentInput && commentInput.id === e.target.id) ||
    (searchInput && searchInput.id === e.target.id)
  ) {
    return;
  }
  const { key } = e;

  e.preventDefault();
  switch (key) {
    case " ":
    case "k":
      handlePlayClick();
      break;
    case "f":
      handleFullscreenClick();
      break;
    case "m":
      handleMuteClick();
      break;
  }
};

const handleCopyURL = () => {
  shareSign.classList.add(VIEW_SIGN);
  videoShareIcon.removeEventListener("click", handleCopyURL);
  setTimeout(() => {
    shareSign.classList.remove(VIEW_SIGN);
  }, 2000);
  setTimeout(() => {
    videoShareIcon.addEventListener("click", handleCopyURL);
  }, 2500);
  navigator.clipboard.writeText(window.document.location.href);
};

window.addEventListener("keydown", handleKeyInput);

play.addEventListener("click", handlePlayClick);
mute.addEventListener("click", handleMuteClick);
volume.addEventListener("input", handleVolumeChange);

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoBox.addEventListener("dblclick", handleFullscreenClick);
videoBox.addEventListener("click", handlePlayClick);

timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("mousedown", handleTimelineMousedown);
timeline.addEventListener("mouseup", handleTimelineMouseup);

fullScreen.addEventListener("click", handleFullscreenClick);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
videoContainer.addEventListener("fullscreenchange", handleFullscreenChange);

videoShareIcon.addEventListener("click", handleCopyURL);
if (video.readyState == 4) {
  handleLoadedMetadata();
}

shareSign.classList.add("video__data--preload");
