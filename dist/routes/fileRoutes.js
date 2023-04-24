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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const path_1 = require("path");
const logger_1 = require("../logger");
const router = express_1.default.Router();
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const appendFileAsync = (0, util_1.promisify)(fs_1.default.appendFile);
const deleteFileAsync = (0, util_1.promisify)(fs_1.default.unlink);
const folderPath = "./files";
router.get('/', (req, res) => {
    res.send('GET request to the homepage');
});
router.get("/readFile/:fileKey", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        const data = yield readFileAsync(filePath, "utf-8");
        logger_1.logger.info('File read successfully with data: \n' + data + '\n from ' + filePath);
        const jsonData = JSON.parse(data);
        res.send(jsonData);
    }
    catch (err) {
        console.log(err);
        logger_1.logger.error('Error reading file ' + err + ' from ' + filePath);
        res.status(500).send("Error reading file");
    }
}));
router.post("/writeFile/:fileKey", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    try {
        yield appendFileAsync(filePath, JSON.stringify(data), "utf-8");
        logger_1.logger.info('File saved successfully with data: \n' + data + '\n from ' + filePath);
        res.send("File saved successfully");
    }
    catch (err) {
        console.log(err);
        logger_1.logger.error('Error writing file ' + err + ' from ' + filePath);
        res.status(500).send("Error writing file");
    }
}));
router.post('/updateFile/:fileKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    try {
        yield writeFileAsync(filePath, JSON.stringify(data), "utf-8");
        logger_1.logger.info('File updated successfully with data: \n' + data + '\n from ' + filePath);
        res.send("File updated successfully");
    }
    catch (err) {
        console.log(err);
        logger_1.logger.error('Error updating file ' + err + ' from ' + filePath);
        res.status(500).send("Error updating file");
    }
}));
router.post('/deleteFile/:fileKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        yield deleteFileAsync(filePath);
        logger_1.logger.info('File deleted successfully from ' + filePath);
        res.send("File deleted successfully");
    }
    catch (err) {
        console.log(err);
        logger_1.logger.error('Error deleting file ' + err + ' from ' + filePath);
        res.status(500).send("Error deleting file");
    }
}));
exports.default = router;
