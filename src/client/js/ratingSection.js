const likeBtn = document.getElementById("video__like");
const likeIcon = document.getElementById("video__like--icon");
const likeSpan = document.getElementById("video__like--span");
const recommandSign = document.querySelector(".video__data--info-sign");

const VIEW_SIGN = "load_sign";
const handleRecommand = async (event) => {
  event.preventDefault();
  const { id } = videoContainer.dataset;

  const response = await fetch(`/api/ratings/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status == 403) {
    recommandSign.classList.add(VIEW_SIGN);
    likeBtn.removeEventListener("click", handleRecommand);
    setTimeout(() => {
      recommandSign.classList.remove(VIEW_SIGN);
    }, 2000);
    setTimeout(() => {
      likeBtn.addEventListener("click", handleRecommand);
    }, 2500);
  }

  if (response.status == 201) {
    const { isCancel, count } = await response.json();
    likeIcon.classList = isCancel ? "far fa-thumbs-up" : "fas fa-thumbs-up";
    likeSpan.innerText = `${count} 개`;
  }
};

likeBtn.addEventListener("click", handleRecommand);
recommandSign.classList.add("video__data--preload");
