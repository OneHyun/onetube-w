import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 5,
    maxlength: 40,
  },
  fileUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => `#${word.replaceAll("#", "").trim()}`);
});

const videoModel = mongoose.model("Video", videoSchema);

export default videoModel;
