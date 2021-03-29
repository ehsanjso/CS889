const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
    question: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    character: {
      type: String,
      required: true,
    },
    startIdx: {
      type: Number,
      required: true,
    },
    endIdx: {
      type: Number,
      required: true,
    },
    hasStar: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Prompt = mongoose.model("Prompt", promptSchema);

module.exports = Prompt;
