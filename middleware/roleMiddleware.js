// middleware/roleMiddleware.js

// Allow only manager role
const requireManager = (req, res, next) => {
  if (req.user && req.user.role === "manager") {
    return next();
  }
  return res.status(403).json({ message: "Access denied: manager only" });
};

module.exports = { requireManager };
