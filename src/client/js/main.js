import "regenerator-runtime";
import "../scss/styles.scss";

const header = document.querySelector("header");
const modeChkBtn = document.getElementById("mode-check");
const modeIcon = document.getElementById("mode-icon");

const preloadClassName = "preload";
let VIEW_MODE = "mode";
let saveModeData;
const modeChange = () => {
  if (saveModeData !== "dark") {
    saveModeData = "dark";
    modeIcon.className = "fas fa-moon";
  } else {
    saveModeData = "light";
    modeIcon.className = "fas fa-sun";
  }

  document.documentElement.setAttribute("color-theme", saveModeData);
  localStorage.setItem(VIEW_MODE, saveModeData);
};

const update = () => {
  modeChkBtn.disabled = true;
  saveModeData =
    localStorage.getItem(VIEW_MODE) !== null
      ? localStorage.getItem(VIEW_MODE)
      : "light";

  saveModeData === "light"
    ? (modeIcon.className = "fas fa-sun")
    : (modeIcon.className = "fas fa-moon");
  document.documentElement.setAttribute("color-theme", saveModeData);

  setTimeout(() => {
    document.body.classList.add(preloadClassName);
    header.classList.add(preloadClassName);
    modeChkBtn.disabled = false;
  }, 500);
};

update();
modeChkBtn.addEventListener("click", modeChange);
