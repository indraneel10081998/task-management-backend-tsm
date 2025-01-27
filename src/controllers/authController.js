const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: "Password must contain at least one letter and one number",
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const userWithoutPassword = user.get({ plain: true });
    delete userWithoutPassword.password;

    res.status(201).json({
      message: "User Registered Successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed", msg: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const userWithoutPassword = user.get({ plain: true });
    delete userWithoutPassword.password;

    const token = jwt.sign({ userId: user?.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(200)
      .json({ message: "Login Successfull", token, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Login failed", msg: error.message });
  }
};
