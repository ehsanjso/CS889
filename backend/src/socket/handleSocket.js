const R = require("ramda");
const Text = require("../models/text");
const OldText = require("../models/oldText");
const User = require("../models/users");

module.exports = function (socket, io) {
  const socketId = socket.handshake.query.userId;
  socket.join(socketId);
  console.log(`new connection id=${socketId}!`);

  socket.on("update-text", async ({ userId, textObject, generalNoteData }) => {
    console.log(generalNoteData);
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

  socket.on("log", async (data) => {});

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
};
