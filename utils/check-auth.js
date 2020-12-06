const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

module.exports = (context) => {
  // context = {...headers}
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    // Bearer ...
    const token = authHeader.split(" ")[1];

    // Get userInfo from token
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid/Expired token", { error });
      }
    }
    throw new Error("Authentication token must be in the format: Bearer");
  }
  throw new Error("Authorization header must be provided");
};
