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
  (req, _res, next) => {
    console.log("LOGIN CALLBACK");
    console.log(req.originalUrl);
    console.log(req.query);
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
