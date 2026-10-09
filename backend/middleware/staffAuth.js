import jwt from "jsonwebtoken";

const staffAuth = (req, res, next) => {
  try {
    const token = req.cookies.staffToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Staff authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.staffId || !decoded.staffType) {
      return res.status(401).json({
        success: false,
        message: "Invalid staff authentication.",
      });
    }

    req.staffId = decoded.staffId;
    req.staffType = decoded.staffType;

    next();
  } catch (error) {
    console.error("Staff auth error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired staff session.",
    });
  }
};

export default staffAuth;
