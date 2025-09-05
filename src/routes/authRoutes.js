// const express = require("express");
// const router = express.Router();
// const path = require("path");

// // const { generateAccessToken, authenticateToken } = require("../auth");
// const JWT = require("../auth");

// const users = {
//    student: {
//       password: "cab432",
//       admin: false,
//    },
//    admin: {
//       password: "admin",
//       admin: true,
//    },
// };

// // Middleware-protected landing page with login form
// router.get("/home", JWT.authenticateToken, (req, res) => {
//     const isAdmin = req.user.admin;
//     if (isAdmin) {
//         res.sendFile(path.join(__dirname, "../../public/admin.html"));
//     } else {
//         res.sendFile(path.join(__dirname, "../../public/index.html"));
//     }
// });

// // User needs to login to obtain an authentication token
// router.post("/login", (req, res) => {
//    // Check the username and password
//    const { username, password } = req.body;
//    const user = users[username];
//    const pwd = users[password];
//    console.log("The user is login now is:"+ username)
//    console.log("The user password is:"+ password)

//    if (!user || password !== user.password) {
//       return res.sendStatus(401);
//    }
//    else{
//     console.log("NICE!HI:" + username)
//    }

//    // Get a new authentication token and send it back to the client
//    console.log("Successful login by user", username);
//    const token = JWT.generateAccessToken({ username });
// //    console.log("This is your login token:", token);
//    res.json({ authToken: token });

// });

// // Logout (前端只要清掉 token 即可)
// router.post("/logout", (req, res) => {
//     // JWT 是 stateless 的，登出只需前端刪除 token
//     res.json({ msg: "Logged out" });
// });



// // Main page protected by our authentication middleware
// router.get("/", JWT.authenticateToken, (req, res) => {
//    res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // Admin page requires admin permissions
// router.get("/admin", JWT.authenticateToken, (req, res) => {
//    // user info added to the request by JWT.authenticateToken
//    // Check user permissions
//    const user = users[req.user.username];
   
//    if (!user || !user.admin) {
//       // bad user or not admin
//       console.log("Unauthorised user requested admin content.");
//       return res.sendStatus(403);
//    }

//    // User permissions verified.
//    res.sendFile(path.join(__dirname, "public", "admin.html"));
// });



// module.exports = router;