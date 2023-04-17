"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const os = __importStar(require("os"));
const cluster_1 = __importDefault(require("cluster"));
const app = (0, express_1.default)();
const port = 3000;
const numCPUs = os.cpus().length;
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const folderPath = './files';
if (cluster_1.default.isPrimary) {
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
}
else {
    app.get('/readFile/:fileName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = req.params.fileName;
        const filePath = (0, path_1.join)(folderPath, fileName);
        try {
            const data = yield readFileAsync(filePath, 'utf-8');
            res.send(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error reading file');
        }
    }));
    app.post('/writeFile/:fileName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = req.params.fileName;
        const filePath = (0, path_1.join)(folderPath, fileName);
        //const data = req.body;
        try {
            yield writeFileAsync(filePath, "my data", 'utf-8');
            res.send('File saved successfully');
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error writing file');
        }
    }));
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
