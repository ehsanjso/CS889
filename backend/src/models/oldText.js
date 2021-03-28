const mongoose = require("mongoose");

const oldTextSchema = new mongoose.Schema(
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

const OldText = mongoose.model("OldText", oldTextSchema);

module.exports = OldText;
