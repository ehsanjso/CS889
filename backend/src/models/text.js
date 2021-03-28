const mongoose = require("mongoose");

const textSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    revision: {
      type: Number,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Text = mongoose.model("Text", textSchema);

module.exports = Text;
