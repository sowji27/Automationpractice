"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePath = void 0;
const path_1 = __importDefault(require("path"));
const FILE_EXTENSION_REGEX = /\.[0-9a-z]+$/i;
function getFilePath(filePath, defaultFilename) {
    let absolutePath = path_1.default.resolve(filePath);
    if (!FILE_EXTENSION_REGEX.test(path_1.default.basename(absolutePath))) {
        absolutePath = path_1.default.join(absolutePath, defaultFilename);
    }
    return absolutePath;
}
exports.getFilePath = getFilePath;
