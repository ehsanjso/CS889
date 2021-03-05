const R = require("ramda");

module.exports = function (socket, io) {
  const socketId = socket.handshake.query.projectId;
  socket.join(socketId);
  console.log(`new connection id=${socketId}!`);

  socket.on("log", async () => {});

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
};
