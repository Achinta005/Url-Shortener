const express = require("express");
const cors = require("cors");
const app = express();
const port = 3002;

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:3000", "https://appsy-ivory.vercel.app"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const mainRoute = require("./routes/linkRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/link", mainRoute);

app.use("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "link-microservice",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
