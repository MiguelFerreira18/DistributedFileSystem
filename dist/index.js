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
const dotenv_1 = __importDefault(require("dotenv"));
const module_1 = __importDefault(require("./module"));
const body_parser_1 = __importDefault(require("body-parser"));
const logger_1 = require("./logger");
const reusable_1 = require("./reusable");
console.log((0, reusable_1.add)(1, 2));
module_1.default.init();
console.log(module_1.default);
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const port = process.env.PORT;
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const deleteFileAsync = (0, util_1.promisify)(fs_1.default.unlink);
const folderPath = "./files";
app.get('/', (req, res) => {
    res.send('GET request to the homepage');
});
app.get("/readFile/:fileKey", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        const data = yield readFileAsync(filePath, "utf-8");
        logger_1.logger.info('File read successfully with data: ' + data + ' from ' + filePath);
        res.send(data);
    }
    catch (err) {
        console.log(err);
        logger_1.logger.error('Error reading file ' + err + ' from ' + filePath);
        res.status(500).send("Error reading file");
    }
}));
app.post("/writeFile/:fileKey", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileKey;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    try {
        yield writeFileAsync(filePath, "new data", "utf-8");
        logger_1.logger.info('File saved successfully with data: ' + data + ' from ' + filePath);
        res.send("File saved successfully");
    }
    catch (err) {
        console.log(err);
        logger_1.logger.error('Error writing file ' + err + ' from ' + filePath);
        res.status(500).send("Error writing file");
    }
}));
app.post('/deleteFile/:fileKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
