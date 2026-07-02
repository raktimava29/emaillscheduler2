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
var pdf_mjs_1 = require("pdfjs-dist/legacy/build/pdf.mjs");
var errors_1 = require("./errors");
var cleanText_1 = require("./cleanText");
function extractPdfText(buffer) {
    return __awaiter(this, void 0, Promise, function () {
        var pdf, text, pageNo, page, content, pageText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pdf_mjs_1.getDocument({
                        data: new Uint8Array(buffer)
                    }).promise];
                case 1:
                    pdf = _a.sent();
                    text = "";
                    pageNo = 1;
                    _a.label = 2;
                case 2:
                    if (!(pageNo <= pdf.numPages)) return [3 /*break*/, 6];
                    return [4 /*yield*/, pdf.getPage(pageNo)];
                case 3:
                    page = _a.sent();
                    return [4 /*yield*/, page.getTextContent()];
                case 4:
                    content = _a.sent();
                    pageText = content.items
                        .map(function (item) { return item.str; })
                        .join(" ");
                    text += pageText + "\n";
                    _a.label = 5;
                case 5:
                    pageNo++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, text];
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
                                source: "text"
                            }];
                    }
                    if (!file) return [3 /*break*/, 2];
                    if (file.mimetype !== "application/pdf") {
                        throw new errors_1.AIError("INVALID_FILE_TYPE", "Only PDF files are supported.");
                    }
                    return [4 /*yield*/, extractPdfText(file.buffer)];
                case 1:
                    pdfText = _a.sent();
                    return [2 /*return*/, {
                            text: cleanText_1.cleanText(pdfText),
                            source: "pdf"
                        }];
                case 2: throw new errors_1.AIError("NO_DOCUMENT", "Please provide job text or upload a PDF.");
            }
        });
    });
}
exports.parseDocument = parseDocument;
