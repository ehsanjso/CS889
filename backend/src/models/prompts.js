const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
    },
    question: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
    hasStar: {
      type: Boolean,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Prompt = mongoose.model("Prompt", promptSchema);

module.exports = Prompt;
