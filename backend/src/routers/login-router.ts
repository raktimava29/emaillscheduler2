import { Router } from "express";
import passport from "../config/passport";
import { getMe, googleCallbackController, login, logout, register } from "../controllers/login-controller";
import { requireAuth } from "../middleware/auth";
import { frontendUrl } from "../config/security";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    const { iss, code } = req.query;
    
    if (!code) {
      console.warn("OAuth callback missing code:", req.query);
      return res.redirect(frontendUrl);
    }

    if (
      typeof iss === "string" &&
      iss !== "https://accounts.google.com"
    ) {
      console.warn("Ignoring invalid OAuth callback:", req.query);
      return res.redirect(frontendUrl);
    }

    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: frontendUrl,
  }),
  googleCallbackController
);

router.get("/me", requireAuth, getMe);

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);

export default router;
