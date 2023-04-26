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
const logger_1 = require("../config/logger");
const path_1 = require("path");
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const module_1 = __importDefault(require("../config/module"));
const folderPath = (0, path_1.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const getPage = (req, res) => {
    res.send("GET request to the homepage");
};
const readFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        const data = yield module_1.default.read(fileName);
        ;
        handleSuccess(1, filePath, data);
        const jsonData = JSON.parse(data);
        res.send(jsonData);
    }
    catch (err) {
        console.log(err);
        handleErrors(1, err, filePath);
        res.status(500).send("Error reading file");
    }
});
const writeFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    try {
        yield module_1.default.create(fileName, data);
        handleSuccess(2, filePath, data);
        res.send("File saved successfully");
    }
    catch (err) {
        console.log(err);
        handleErrors(2, err, filePath);
        res.status(500).send("Error writing file");
    }
});
const updateFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    try {
        yield module_1.default.update(fileName, data);
        handleSuccess(3, filePath, data);
        res.send("File updated successfully");
    }
    catch (err) {
        console.log(err);
        handleErrors(3, err, filePath);
        res.status(500).send("Error updating file");
    }
});
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        yield module_1.default.delete(fileName);
        handleSuccess(4, filePath);
        res.send("File deleted successfully");
    }
    catch (err) {
        console.log(err);
        handleErrors(4, err, filePath);
        res.status(500).send("Error deleting file");
    }
});
const handleErrors = (errorLevel, err, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    switch (errorLevel) {
        case 1:
            logger_1.logger.error("Error reading file " + err + " from " + filePath);
            break;
        case 2:
            logger_1.logger.error("Error writing file " + err + " from " + filePath);
            break;
        case 3:
            logger_1.logger.error("Error updating file " + err + " from " + filePath);
            break;
        case 4:
            logger_1.logger.error("Error deleting file " + err + " from " + filePath);
            break;
        default:
            logger_1.logger.error("Error " + err + " from " + filePath);
            break;
    }
});
const handleSuccess = (successLevel, filePath, data) => __awaiter(void 0, void 0, void 0, function* () {
    switch (successLevel) {
        case 1:
            logger_1.logger.info("File read successfully with data: \n" + data + "\n from " + filePath);
            break;
        case 2:
            logger_1.logger.info("File saved successfully with data: \n" + data + "\n from " + filePath);
            break;
        case 3:
            logger_1.logger.info("File updated successfully with data: \n" + data + "\n from " + filePath);
            break;
        case 4:
            logger_1.logger.info("File deleted successfully from " + filePath);
            break;
        default:
            logger_1.logger.info("Success from " + filePath);
            break;
    }
});
exports.default = { getPage, readFile, writeFile, updateFile, deleteFile };
