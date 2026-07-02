"use strict";
exports.__esModule = true;
exports.groq = void 0;
var groq_sdk_1 = require("groq-sdk");
var ai_1 = require("./config/ai");
exports.groq = new groq_sdk_1["default"]({
    apiKey: ai_1.AI_CONFIG.apiKey
});
