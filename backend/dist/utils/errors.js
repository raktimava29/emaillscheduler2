"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIError = void 0;
class AIError extends Error {
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "AIError";
    }
}
exports.AIError = AIError;
