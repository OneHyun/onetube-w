const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    videoRecorder: BASE_JS + "videoRecorder.js",
    commentSection: BASE_JS + "commentSection.js",
    ratingSection: BASE_JS + "ratingSection.js",
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "./assets"),
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/style.css",
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
