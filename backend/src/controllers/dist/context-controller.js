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
exports.contextController = void 0;
var documentParser_1 = require("../utils/documentParser");
var extractSections_1 = require("../utils/extractSections");
var resume_service_1 = require("../services/resume-service");
var jobParser_service_1 = require("../services/jobParser-service");
var context_service_1 = require("../services/context-service");
var errors_1 = require("../utils/errors");
function contextController(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var files, resumeDocument, resumeSections, resume, jobDocument, job, context, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    files = req.files;
                    return [4 /*yield*/, documentParser_1.parseDocument(req.body.resumeText, (_a = files === null || files === void 0 ? void 0 : files.resumeFile) === null || _a === void 0 ? void 0 : _a[0])];
                case 1:
                    resumeDocument = _c.sent();
                    resumeSections = extractSections_1.extractSections(resumeDocument.text);
                    return [4 /*yield*/, resume_service_1.parseResume(resumeDocument.text, resumeSections, resumeDocument.links)];
                case 2:
                    resume = _c.sent();
                    return [4 /*yield*/, documentParser_1.parseDocument(req.body.jobText, (_b = files === null || files === void 0 ? void 0 : files.jobFile) === null || _b === void 0 ? void 0 : _b[0])];
                case 3:
                    jobDocument = _c.sent();
                    return [4 /*yield*/, jobParser_service_1.parseJob(jobDocument.text)];
                case 4:
                    job = _c.sent();
                    return [4 /*yield*/, context_service_1.buildCandidateContext(resume, job)];
                case 5:
                    context = _c.sent();
                    return [2 /*return*/, res.json(context)];
                case 6:
                    err_1 = _c.sent();
                    if (err_1 instanceof errors_1.AIError) {
                        return [2 /*return*/, res.status(err_1.statusCode).json({
                                success: false,
                                code: err_1.code,
                                message: err_1.message
                            })];
                    }
                    console.error(err_1);
                    return [2 /*return*/, res.status(500).json({
                            success: false,
                            code: "AI_ERROR",
                            message: "Something went wrong."
                        })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.contextController = contextController;
