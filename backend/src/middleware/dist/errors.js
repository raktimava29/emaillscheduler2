"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.AIError = void 0;
var AIError = /** @class */ (function (_super) {
    __extends(AIError, _super);
    function AIError(code, message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.statusCode = statusCode;
        _this.name = "AIError";
        return _this;
    }
    return AIError;
}(Error));
exports.AIError = AIError;
