import userModel from "../models/user";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import session from "express-session";
import videoModel from "../models/video";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  const exists = await userModel.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }

  try {
    await userModel.create({ name, username, email, password, location });
    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("join", { pageTitle, errorMessage: error._message });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username, createdSocialLogin: false });
  const pageTitle = "Login";
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  const correct = await bcrypt.compare(password, user.password);
  if (!correct) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITH_CLIENT,
    allow_signup: true,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITH_CLIENT,
    client_secret: process.env.GITH_SECRECT,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiURL = "https://api.github.com/";
    const userData = await (
      await fetch(`${apiURL}user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailDataGroup = await (
      await fetch(`${apiURL}user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailDataGroup.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    const findUsername = await userModel.findOne({ username: userData.login });
    //connect account through github email
    let user = await userModel.findOne({ email: emailObj.email });
    if (!user) {
      const chkExistSameNameUser =
        findUsername === null
          ? false
          : Boolean(findUsername.username === userData.login);
      let count = 0;
      if (chkExistSameNameUser) {
        count = await userModel.count({
          username: { $regex: userData.login },
        });
      }
      console.log(count);

      user = await userModel.create({
        name: userData.name ? userData.name : userData.login,
        avatarUrl: userData.avatar_url,
        createdSocialLogin: true,
        username: chkExistSameNameUser
          ? `${userData.login}_${count}`
          : userData.login,
        email: emailObj.email,
        password: "",
        location: userData.location ? userData.location : "Unknown",
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login", { errorMessage: "not accessed" });
  }
};

export const startKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAO_CLIENT,
    code: req.query.code,
    scope: "profile_nickname profile_image account_email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiURL = "https://kapi.kakao.com";
    const userData = await (
      await fetch(`${apiURL}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    const findUsername = await userModel.findOne({ usernam: userData.login });
    //connect account through kakao email
    let user = await userModel.findOne({ email: userData.kakao_account.email });
    if (!user) {
      const chkExistSameNameUser =
        findUsername === null
          ? false
          : Boolean(
              findUsername.username === userData.kakao_account.profile.nickname
            );
      let count = 0;
      if (chkExistSameNameUser) {
        count = await userModel.count({
          username: { $regex: userData.kakao_account.profile.nickname },
        });
      }
      console.log(count);

      user = await userModel.create({
        name: userData.kakao_account.profile.nickname,
        avatarUrl: userData.kakao_account.profile.profile_image_url,
        createdSocialLogin: true,
        username: chkExistSameNameUser
          ? `${userData.kakao_account.profile.nickname}_${count}`
          : userData.kakao_account.profile.nickname,
        email: userData.kakao_account.email,
        password: "",
        location: "",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
  } else {
    return res.redirect("/login", { errorMessage: "not accessed" });
  }

  res.send(userData);
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEditProfile = (req, res) => {
  return res.render("users/edit_profile", { pageTitle: "Edit Profile" });
};
export const postEditProfile = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, username, location },
    file,
  } = req;

  const findUsername = await userModel.findOne({ username });
  if (findUsername && findUsername.id != _id) {
    return res.render("users/edit_profile", {
      pageTitle: "Edit Profile",
      errorMessage: "Already user is exist",
    });
  }

  const updateUser = await userModel.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect("edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.createdSocialLogin === true) {
    return res.redirect("/");
  }
  return res.render("users/change_password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirm },
  } = req;

  const user = await userModel.findById(_id);
  const isMatchPW = await bcrypt.compare(oldPassword, user.password);
  if (!isMatchPW) {
    return res.status(400).render("users/change_password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }

  if (oldPassword === newPassword) {
    return res.status(400).render("users/change_password", {
      pageTitle,
      errorMessage: "The old password equals new password",
    });
  }

  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render("users/change_password", {
      pageTitle: "Change Password",
      errorMessage: "The Password does not match the confirmation",
    });
  }

  user.password = newPassword;
  await user.save();
  req.session.destroy();
  return res.redirect("/login");
};

export const see = async (req, res) => {
  const {
    params: { id },
  } = req;

  const user = await userModel.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }

  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
export const remove = (req, res) => res.send("Remove User");
