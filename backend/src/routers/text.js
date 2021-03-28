const express = require("express");
const User = require("../models/users");
const router = new express.Router();

router.get("/text/:userId", async (req, res) => {
  let userId = req.params.userId;
  const user = await User.findById(userId).populate("text").exec();

  try {
    const text = user.text;
    res.status(200).send(text);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
