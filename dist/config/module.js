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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const path_2 = require("path");
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const groups_1 = require("../src/groups");
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const axios_1 = __importDefault(require("axios"));
const subGroup_1 = require("../src/subGroup");
const config_1 = __importDefault(require("../models/config"));
const crypto_1 = __importDefault(require("crypto"));
let dbKernel;
let home;
let dbDir;
const folderPath = (0, path_2.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const WRITE_OPERATION = "write";
const UPDATE_OPERATION = "update";
const READ_OPERATION = "read";
const DELETE_OPERATION = "delete";
const SEND_OPERATION = "send";
dbKernel = {
    init: async function (groupHash, server) {
        home = dbPardal_json_1.default.home;
        //File DB Dir
        dbDir = path_1.default.join(home, dbPardal_json_1.default.dbDir);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir);
            console.log(`Directory ${dbDir} created successfully.`);
        }
        //check if the groupHash is in the groupMap and if it is check it to is active true
        if (groups_1.groupMap.has(groupHash)) {
            const group = groups_1.groupMap.get(groupHash);
            group.isActive = true;
            group.server = server;
            group.proxy = (0, express_http_proxy_1.default)(group.server);
            console.log("was group");
            console.log(group);
            return true;
        }
        return false;
    },
    gossip: async function (fileName, functionality, body) {
        console.log("Check");
        console.log(body);
        subGroup_1.mySubServers.forEach(async (element) => {
            console.log(element);
            if (element.serverAdress.search(config_1.default.PORT) < 0) {
                const url = `${element.serverAdress}file/receive/${fileName}`;
                await axios_1.default.post(url, {
                    body,
                    functionality,
                });
                console.log("end");
            }
        });
    },
    create: async function (fileName, messageBody) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        await (0, fs_1.appendFileSync)(filePath, JSON.stringify(messageBody), "utf-8");
    },
    update: async function (fileName, messageBody) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        await (0, fs_1.writeFileSync)(filePath, JSON.stringify(messageBody), "utf-8");
    },
    read: async function (fileName) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        const data = await (0, fs_1.readFileSync)(filePath, "utf-8");
        const jsonData = JSON.parse(data);
        return jsonData.messageBody;
    },
    delete: async function (fileName) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        await (0, fs_1.unlinkSync)(filePath);
    },
    groupServerStatus: async function () {
        await console.log(groups_1.groupMap);
    },
    receiveFile: async function (req, res) {
        console.log(req.data);
        const FUNCTIONALITY = req.body.functionality;
        const fileName = req.params.fileName;
        const message = {
            fileName,
            messageBody: req.body.body
        };
        const md5 = await createDigest(fileName);
        switch (FUNCTIONALITY) {
            case WRITE_OPERATION:
                await this.create(md5, message);
                break;
            case UPDATE_OPERATION:
                await this.update(md5, message);
                break;
            case READ_OPERATION:
                await this.read(md5);
                break;
            case DELETE_OPERATION:
                await this.delete(md5);
                break;
            default:
                console.log("ERROR");
                res.status(404).send("ERROR");
                break;
        }
        res.status(200).send("ok");
    },
};
const createDigest = async (fileName) => {
    return crypto_1.default.createHash("md5").update(fileName).digest("hex");
};
exports.default = dbKernel;
