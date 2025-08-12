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
    const decoded = jwt.verify(token, process.env.JWT_SERECT_KEY);
    const users = await User.findOne({ token: decoded });

    if (!users) {
      return res.status(404).json({
        status_code: 404,
        message: "invalid Token",
        success: false,
      });
    }

    req.user = users;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
      status_code: 500,
      message: "Something went wrong.",
      success: false,
    });
  }
};

export { auth };
