"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gemini = exports.groq = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const genai_1 = require("@google/genai");
const ai_1 = require("./config/ai");
exports.groq = new groq_sdk_1.default({
    apiKey: ai_1.AI_CONFIG.apiKey,
});
exports.gemini = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
