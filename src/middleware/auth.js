import jwt from "jsonwebtoken"
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
    req.user = decoded;
    
    next();
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status_code: 500,
      message: "Something went wrong...",
      success: false,
    });
  }
};

export { auth };
