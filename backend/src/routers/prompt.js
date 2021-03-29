const express = require("express");
const User = require("../models/users");
const router = new express.Router();

router.get("/prompts/:userId", async (req, res) => {
  let userId = req.params.userId;

  const user = await User.findById(userId).populate("prompts").exec();

  try {
    const prompts = user.prompts;
    res.status(200).send(prompts);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
