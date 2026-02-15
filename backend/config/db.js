const mongoose = require("mongoose");
require("dotenv").config(); // <-- REQUIRED

const MONGO_URI = process.env.MONGO_LINK_SHORT_URL;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_LINK_SHORT_URL is not defined");
}

const LinkShortDB = mongoose.createConnection(MONGO_URI);

LinkShortDB.on("connected", () => {
  console.log("✅ Server DB connected");
});

LinkShortDB.on("error", (err) => {
  console.error("❌ Mongo connection error:", err);
});

module.exports = LinkShortDB;
