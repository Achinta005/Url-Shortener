const express = require("express");
const app = express();
const port = 3002;

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
