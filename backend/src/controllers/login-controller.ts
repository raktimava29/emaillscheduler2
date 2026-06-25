import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../config/db";
import { randomUUID } from "crypto";
import { frontendUrl, authCookieName, authCookieOptions, jwtExpiresIn, jwtSecret } from "../config/security";

function signSessionToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

export const googleCallbackController = (req: Request, res: Response) => {
  const user = req.user as any;

  if (!user) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  try {
    const token = signSessionToken(user);

    res.cookie(authCookieName, token, authCookieOptions);
    return res.redirect(`${frontendUrl}/auth/callback`);
  } catch {
    return res.status(500).json({ error: "JWT secret missing" });
  }
};

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

    const token = signSessionToken(user);

    res.cookie(authCookieName, token, authCookieOptions);
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

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

export function logout(_req: Request, res: Response) {
  res.clearCookie(authCookieName, {
    ...authCookieOptions,
    maxAge: undefined,
  });

  res.json({ message: "Logged out" });
}
