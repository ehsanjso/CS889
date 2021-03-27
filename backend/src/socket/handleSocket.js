const R = require("ramda");
const Text = require("../models/text");
const OldText = require("../models/oldText");
const User = require("../models/users");

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

  socket.on("initiate-prompt", async ({}) => {
    io.to(socketId).emit("receive-prompt", {
      _id: 11111,
      question: "What you doing man? Come on?",
    });
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

  socket.on("log", async (data) => {});

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
};
