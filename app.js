const express = require("express");
const path = require("path");
const JWT = require("./src/auth"); // JWT utility for token generation & verification
const videoRoutes = require("./src/routes/videoRoutes");

const app = express();
const port = 3000;

// ------------------ Middleware ------------------
// Parse incoming JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Mount video-related routes under /videos
app.use("/videos", videoRoutes);

// ------------------ Hard-coded User Accounts ------------------
// Reference: CAB432 course material for simple authentication examples
const users = {
  student: { password: "cab432", admin: false },
  admin: { password: "admin", admin: true },
};

// ------------------ Login API ------------------
// POST /auth/login
// Handles user login, returns JWT token
// ChatGPT suggestion: Separate login POST from login page GET for clarity
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  // Reject invalid credentials
  if (!user || password !== user.password) {
    return res.sendStatus(401);
  }

  // Generate JWT token with username and admin flag
  const token = JWT.generateAccessToken(username, user.admin);
  console.log(`Login successful: ${username}, admin=${user.admin}`);
  res.json({ authToken: token });
});

// ------------------ Login Page ------------------
// GET /
// Serve login page (index.html)
// ChatGPT suggestion: Use a dedicated login page to prevent JWT middleware conflict
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ------------------ User Page ------------------
// GET /user
// Serve user page, protected by JWT authentication
// Reference: CAB432 materials on JWT middleware usage
app.get("/user", JWT.authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public/user.html"));
});

// ------------------ Admin Verification API ------------------
// GET /admin/verify
// Used by frontend to verify if the logged-in user has admin privileges
// ChatGPT suggestion: Separate API to validate admin role before serving admin page
app.get("/admin/verify", JWT.authenticateToken, (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  res.json({ msg: "Verified admin" });
});

// ------------------ Admin Page ------------------
// GET /admin
// Serve admin page, protected by JWT authentication and admin role check
// Reference: CAB432 course notes on role-based access control
app.get("/admin", JWT.authenticateToken, (req, res) => {
  const user = users[req.user.username];

  if (!user || !user.admin) {
    console.log("Unauthorized user requested admin page:", req.user.username);
    return res.sendStatus(403);
  }

  res.sendFile(path.join(__dirname, "public/admin.html"));
});

// ------------------ Start Server ------------------
// Listen on the configured port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

