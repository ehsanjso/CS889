const mongoose = require("mongoose");

const dbURL = `mongodb://${process.env.MONGO_URL || "localhost:27017/cs889"}`;

mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.once("open", function () {
  console.log("Mongoose connection successful.");
});

module.exports = mongoose;
