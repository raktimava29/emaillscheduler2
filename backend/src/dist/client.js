"use strict";
exports.__esModule = true;
exports.gemini = exports.groq = void 0;
var groq_sdk_1 = require("groq-sdk");
var genai_1 = require("@google/genai");
var ai_1 = require("./config/ai");
exports.groq = new groq_sdk_1["default"]({
    apiKey: ai_1.AI_CONFIG.apiKey
});
exports.gemini = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
