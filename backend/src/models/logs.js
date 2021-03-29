const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    studyTime: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
