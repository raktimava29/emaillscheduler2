import { Router } from "express";
import passport from "../config/passport";
import { getMe, googleCallbackController, login, register } from "../controllers/login-controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallbackController
);

router.get("/me", requireAuth, getMe);

router.post("/login", login);
router.post("/register", register);

export default router;
