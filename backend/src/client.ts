import Groq from "groq-sdk";
import { AI_CONFIG } from "./config/ai";

export const groq = new Groq({
    apiKey: AI_CONFIG.apiKey,
});