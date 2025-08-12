import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
const auth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization || req.cookies?.authorization;
    if (!token) {
      return res.status(400).json({
        status_code: 400,
        message: "authorization User",
        success: false,
      });
    }
    const users = await User.findOne({ token: token });

    if (!users) {
      return res.status(404).json({
        status_code: 404,
        message: "invalid Token",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SERECT_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status_code: 401,
        message: "Invalid token signature",
        success: false,
      });
    } else {
      return res.status(500).json({
        error,
        status_code: 500,
        message: "Something went wrong.",
        success: false,
      });
    }
  }
};

export { auth };
