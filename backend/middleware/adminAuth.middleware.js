import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    console.error("Admin auth error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

export default adminAuth;
