const express = require("express");
const path = require("path");
const videoRoutes = require("./src/routes/videoRoutes");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/videos", videoRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
