"use strict";
exports.__esModule = true;
exports.EmailSchema = void 0;
var zod_1 = require("zod");
exports.EmailSchema = zod_1.z.object({
    subject: zod_1.z.string().trim().min(1),
    body: zod_1.z.string().trim().min(1),
    confidenceScore: zod_1.z.number().min(0).max(1)
});
