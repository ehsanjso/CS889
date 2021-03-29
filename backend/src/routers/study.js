const express = require("express");
const mongoose = require("mongoose");
const router = new express.Router();
const R = require("ramda");
const auth = require("../middleware/auth");
const User = require("../models/users");
const Text = require("../models/text");
const OldText = require("../models/oldText");
const Prompt = require("../models/prompts");
const Log = require("../models/logs");

const isAdmin = (el) => el.isAdmin;

router.get("/study/text", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const texts = await Text.find({});
      res.status(200).send(texts);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/users", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const users = await User.find({});
      res.status(200).send(users);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/users/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const user = await User.findById(req.params.userId);
      res.status(200).send(user);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/prompts", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const prompts = await Prompt.find({});
      res.status(200).send(prompts);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/prompts/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const prompts = await Prompt.find({
        user: req.params.userId,
      });
      res.status(200).send(prompts);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/oldText", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const oldTexts = await OldText.find({});
      res.status(200).send(oldTexts);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/oldText/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const comments = await OldText.find({
        user: req.params.userId,
      });
      res.status(200).send(comments);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/logs", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const logs = await Log.find({});
      res.status(200).send(logs);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/study/logs/:userId", auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const logs = await Log.find({
        userId: req.params.userId,
      });
      res.status(200).send(logs);
    } else {
      res.status(403).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

module.exports = router;
