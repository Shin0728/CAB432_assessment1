const jwt = require("jsonwebtoken");

// code copy from the cab432 material and chat gpt.



// Create a token with username embedded, setting the validity period.
const generateAccessToken = (username, adminState) => {     //user
   // console.log("Token:" + tokenSecret);
   console.log("generateAccessToken called with:", username, adminState);
   const tokenSecret = process.env.JWT_SECRET;
   const token = jwt.sign({ username, role: adminState ? "admin" : "user" }, tokenSecret, { expiresIn: "1d" });
   console.log("JWT payload:", jwt.decode(token)); 
   return token; 
};

// Middleware to verify a token and respond with user information
const authenticateToken = (req, res, next) => {
   // We are using Bearer auth.  The token is in the authorization header.
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(' ')[1];

   if (!token) {
      return res.sendStatus(401);
   }

   // Check that the token is valid
   try {
      const user = jwt.verify(token, process.env.JWT_SECRET);

      console.log(
         `authToken verified for user: ${user.username} at URL ${req.url}`
      );

      // Add user info to the request for the next handler
      req.user = user;
      console.log("user role:" + user.role);
      next();
   } catch (err) {
      console.log(
         `JWT verification failed at URL ${req.url}`,
         err.name,
         err.message
      );
      return res.sendStatus(401);
   }
};



module.exports = { generateAccessToken, authenticateToken };
