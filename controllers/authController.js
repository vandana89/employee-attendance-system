// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, employeeId, department } = req.body;

    // Basic validation
    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingEmp = await User.findOne({ employeeId });
    if (existingEmp) {
      return res.status(400).json({ message: "Employee ID already used" });
    }

    const user = await User.create({
      name,
      email,
      password, // will be hashed in User model pre-save hook
      role: role || "employee",
      employeeId,
      department,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // protect middleware already attached user
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
