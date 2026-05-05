import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// ─────────────────────────────────────────
// authenticate — verifikasi JWT, inject req.user
// ─────────────────────────────────────────
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Authorization required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

// ─────────────────────────────────────────
// authorize — role-based access control
// Usage: authorize("ADMIN") atau authorize("ADMIN", "MANAGER")
// ─────────────────────────────────────────
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }

    next();
  };
};