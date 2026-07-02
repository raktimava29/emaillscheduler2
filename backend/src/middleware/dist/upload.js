"use strict";
exports.__esModule = true;
exports.upload = void 0;
var multer_1 = require("multer");
exports.upload = multer_1["default"]({
    storage: multer_1["default"].memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
