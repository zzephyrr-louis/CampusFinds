const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { get, run } = require("../db");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const jwtSecret = process.env.JWT_SECRET || "campusfind-development-secret";
const tokenExpiry = process.env.JWT_EXPIRES_IN || "1d";

function sanitizeUser(user) {
  return {
    user_id: user.user_id,
    student_id: user.student_id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  };
}

function validateRegistration(body) {
  const errors = {};
  const studentId = body.student_id?.trim();
  const fullname = body.fullname?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!studentId) errors.student_id = "Student ID is required.";
  if (!fullname) errors.fullname = "Full name is required.";
  if (!email) errors.email = "Email is required.";
  if (email && !emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  if (password && password.length < 8) errors.password = "Password must be at least 8 characters.";

  return {
    values: { studentId, fullname, email, password },
    errors,
  };
}

function validateLogin(body) {
  const errors = {};
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email) errors.email = "Email is required.";
  if (email && !emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";

  return {
    values: { email, password },
    errors,
  };
}

function createToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: tokenExpiry }
  );
}

async function register(req, res) {
  try {
    const { values, errors } = validateRegistration(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Registration validation failed.", errors });
    }

    const existingUser = await get(
      "SELECT user_id FROM Users WHERE email = ? OR student_id = ?",
      [values.email, values.studentId]
    );

    if (existingUser) {
      return res.status(409).json({
        message: "An account with that email or student ID already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(values.password, 12);
    const result = await run(
      `INSERT INTO Users (student_id, fullname, email, password, role)
       VALUES (?, ?, ?, ?, 'student')`,
      [values.studentId, values.fullname, values.email, hashedPassword]
    );

    const user = await get("SELECT * FROM Users WHERE user_id = ?", [result.id]);
    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).json({ message: "Unable to register account." });
  }
}

async function login(req, res) {
  try {
    const { values, errors } = validateLogin(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Login validation failed.", errors });
    }

    const user = await get("SELECT * FROM Users WHERE email = ?", [values.email]);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(values.password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Unable to log in." });
  }
}

module.exports = {
  login,
  register,
};
