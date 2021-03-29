const R = require("ramda");
const axios = require("axios");
const Text = require("../models/text");
const OldText = require("../models/oldText");
const Prompt = require("../models/prompts");
const User = require("../models/users");
const Log = require("../models/logs");

const host = "http://165.227.42.195:5000";

module.exports = function (socket, io) {
  const socketId = socket.handshake.query.socketId;
  socket.join(socketId);
  console.log(`new connection id=${socketId}!`);

  socket.on("update-text", async ({ userId, textObject, generalNoteData }) => {
    const user = await User.findById(userId).populate("text").exec();
    const text = user.text;
    const rawText = JSON.stringify(textObject);
    const rawNote = JSON.stringify(generalNoteData);
    let revision = 0;

    if (!R.isEmpty(text)) {
      const oldText = await Text.findById(text[0]._id);
      const newOldText = new OldText({
        user: oldText.user,
        text: oldText.text,
        note: oldText.note,
        revision: oldText.revision,
      });
      await newOldText.save();
      revision = oldText.revision;
      await oldText.delete();
    }

    const newText = new Text({
      user: userId,
      text: rawText,
      note: rawNote,
      revision: revision + 1,
    });
    await newText.save();
  });

  socket.on("initiate-prompt", async ({ text, userId, type }) => {
    try {
      // const { data } = await axios.get(
      //   encodeURI(
      //     `${host}/api/get_all_prompts?user_text=${text}&prompt_type=story`
      //   )
      // );

      const { data } = await axios.get(
        encodeURI(
          `${host}/api/get_next_prompt?user_text=${text}&prompt_type=${type}&user_id=${userId}`
        )
      );

      if (!R.isEmpty(data)) {
        const newPrompt = {
          isActive: true,
          user: userId,
          question: data.prompt_text,
          startIdx: data.start_idx,
          endIdx: data.end_idx,
          hasStar: false,
          character: data.character,
          deleted: false,
          type,
        };

        const prompt = new Prompt(newPrompt);
        prompt.save();

        io.to(socketId).emit("receive-prompt", prompt);
      } else {
        io.to(socketId).emit("receive-prompt", undefined);
      }

      io.to(socketId).emit("change-loading", false);
    } catch (e) {
      console.log(e);
      io.to(socketId).emit("receive-prompt", undefined);
      io.to(socketId).emit("change-loading", false);
    }
  });

  socket.on("update-prompt-note", async ({ promptId, noteObject }) => {
    const prompt = await Prompt.findById(promptId);
    const rawNote = JSON.stringify(noteObject);

    prompt.note = rawNote;
    await prompt.save();

    io.to(socketId).emit("update-prompt", prompt);
  });

  socket.on("update-prompt-feedback", async ({ promptId, hasStar }) => {
    const prompt = await Prompt.findById(promptId);
    prompt.hasStar = hasStar;
    await prompt.save();
    io.to(socketId).emit("update-prompt", prompt);
  });

  socket.on("update-study-time", async ({ userId, studyTime }) => {
    const user = await User.findById(userId);
    user.studyTime = studyTime;
    await user.save();
    io.to(socketId).emit("update-user", user);
  });

  socket.on("update-study-done", async ({ userId, isStudyDone }) => {
    const user = await User.findById(userId);
    user.isStudyDone = isStudyDone;
    await user.save();
    io.to(socketId).emit("update-user", user);
  });

  socket.on("update-pauses", async ({ userId, pause }) => {
    const user = await User.findById(userId);
    user.pauses = user.pauses.concat(pause);
    await user.save();
    io.to(socketId).emit("update-user", user);
  });

  socket.on("log", async (data) => {
    const newLog = new Log(data);
    newLog.save();
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
};
