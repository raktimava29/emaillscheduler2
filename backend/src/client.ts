import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config/ai";

export const groq = new Groq({
    apiKey: AI_CONFIG.apiKey,
});

export const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});