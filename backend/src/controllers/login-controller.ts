import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../config/db";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();
const frontend = process.env.FRONTEND_URL

export const googleCallbackController = (req: Request, res: Response) => {
  const user = req.user as any;

  if (!user) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT secret missing" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
    
  console.log(frontend)
  return res.redirect(
    `${frontend}/auth/callback?token=${token}`
  );
};

/**
 * REGISTER (Non-Gmail)
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const id = randomUUID();

    const name = email.split("@")[0];
    
    await db.query(
      `
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      `,
      [id, name, email, hashedPassword]
    );

    res.json({ message: "User registered" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

/**
 * LOGIN (email + password)
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    // Gmail Users
    if (!user.password) {
      return res.status(400).json({
        error: "Use Google login for this account",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * GET /auth/me
 */
export async function getMe(req: Request, res: Response) {
  const userId = (req as any).user.userId;

  const { rows } = await db.query(
    "SELECT id, name, email, avatar_url FROM users WHERE id = $1",
    [userId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(rows[0]);
}