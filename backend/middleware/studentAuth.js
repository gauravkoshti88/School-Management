import jwt from "jsonwebtoken";

const studentAuth = (req, res, next) => {
  try {
    const token = req.cookies.studentToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.studentId) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    req.studentId = decoded.studentId;

    next();
  } catch (error) {
    console.error("Student auth error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired student session.",
    });
  }
};

export default studentAuth;
