const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentInput = form.querySelector("#input-comment");
const btn = form.querySelector("button");
const commentDeleteBtns = document.querySelectorAll(
  "#video__comment-delete--btn"
);

const addComment = (comment, id) => {
  const videoComments = document.querySelector(".video__comments ul");

  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;

  const newCommentLeft = document.createElement("div");
  newCommentLeft.className = "video__comment--left";

  const icon = document.createElement("i");
  icon.className = "fas fa-comment";

  const newCommentUserInfo = document.createElement("div");
  newCommentUserInfo.className = "video__comment--spans";

  const span = document.createElement("span");
  span.innerText =
    `${form.dataset.username}님이 작성함 ` +
    new Date().toLocaleDateString("ko-kr").replaceAll(" ", "");

  const span2 = document.createElement("span");
  span2.innerText = comment;

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fas fa-eraser";
  deleteIcon.addEventListener("click", handleDelete);

  newCommentLeft.appendChild(icon);
  newCommentUserInfo.appendChild(span);
  newCommentUserInfo.appendChild(span2);
  newCommentLeft.appendChild(newCommentUserInfo);
  newComment.appendChild(newCommentLeft);
  newComment.appendChild(deleteIcon);

  videoComments.prepend(newComment);
};

const deleteNewComment = (event) => {
  const deleteComment = document.querySelector(".video__comments ul");
  deleteComment.removeChild(event.target.parentElement);
};

const handleDelete = async (event) => {
  const { id } = event.target.parentElement.dataset;
  const response = await fetch(`/api/comments/${id}/delete`, {
    method: "POST",
  });
  if (response.status === 201) {
    deleteNewComment(event);
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const text = commentInput.value;
  const { id } = videoContainer.dataset;

  if (text === "") return;

  const response = await fetch(`/api/comments/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    commentInput.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const Init = () => {
  commentDeleteBtns.forEach((element) =>
    element.addEventListener("click", handleDelete)
  );
};

form.addEventListener("submit", handleSubmit);
Init();
