"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.parseDocument = void 0;
var pdf_parse_1 = require("pdf-parse");
var errors_1 = require("./errors");
var cleanText_1 = require("./cleanText");
function detectLabel(url) {
    var value = url.toLowerCase();
    if (value.includes("github")) {
        return "GitHub";
    }
    if (value.includes("linkedin")) {
        return "LinkedIn";
    }
    if (value.includes("leetcode")) {
        return "LeetCode";
    }
    if (value.includes("codeforces")) {
        return "Codeforces";
    }
    if (value.includes("portfolio")) {
        return "Portfolio";
    }
    return undefined;
}
function extractPdfContent(buffer) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var data, text, links, visibleLinks, _loop_1, _i, visibleLinks_1, url;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pdf_parse_1["default"](buffer)];
                case 1:
                    data = _b.sent();
                    text = data.text;
                    links = [];
                    visibleLinks = (_a = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|(?:github(?:\.com)?|linkedin(?:\.com)?\/?(?:in)?|leetcode(?:\.com)?|codeforces(?:\.com)?)\/[^\s]+)/gi)) !== null && _a !== void 0 ? _a : [];
                    _loop_1 = function (url) {
                        if (url.startsWith("github/")) {
                            url = url.replace("github/", "https://github.com/");
                        }
                        if (url.startsWith("linkedin/")) {
                            url = url.replace("linkedin/", "https://linkedin.com/in/");
                        }
                        if (url.startsWith("leetcode/")) {
                            url = url.replace("leetcode/", "https://leetcode.com/");
                        }
                        if (url.startsWith("codeforces/")) {
                            url = url.replace("codeforces/", "https://codeforces.com/profile/");
                        }
                        if (!links.some(function (link) { return link.url === url; })) {
                            links.push({
                                url: url,
                                label: detectLabel(url)
                            });
                        }
                    };
                    for (_i = 0, visibleLinks_1 = visibleLinks; _i < visibleLinks_1.length; _i++) {
                        url = visibleLinks_1[_i];
                        _loop_1(url);
                    }
                    return [2 /*return*/, {
                            text: text,
                            links: links
                        }];
            }
        });
    });
}
function parseDocument(text, file) {
    return __awaiter(this, void 0, Promise, function () {
        var pdfText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (text === null || text === void 0 ? void 0 : text.trim()) {
                        return [2 /*return*/, {
                                text: cleanText_1.cleanText(text),
                                source: "text",
                                links: []
                            }];
                    }
                    if (!file) return [3 /*break*/, 2];
                    if (file.mimetype !== "application/pdf") {
                        throw new errors_1.AIError("INVALID_FILE_TYPE", "Only PDF files are supported.");
                    }
                    return [4 /*yield*/, extractPdfContent(file.buffer)];
                case 1:
                    pdfText = _a.sent();
                    return [2 /*return*/, {
                            text: cleanText_1.cleanText(pdfText.text),
                            source: "pdf",
                            links: pdfText.links
                        }];
                case 2: throw new errors_1.AIError("NO_DOCUMENT", "Please provide job text or upload a PDF.");
            }
        });
    });
}
exports.parseDocument = parseDocument;
