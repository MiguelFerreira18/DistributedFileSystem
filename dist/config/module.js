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
        subGroup_1.mySubServers.forEach((element) => {
            if (!element.isLeader) {
                const url = `http://${element.serverAdress}/receive/${fileName}`;
                axios_1.default.post(url, {
                    body,
                    functionality,
                });
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
        const FUNCTIONALITY = req.data.functionality;
        const fileName = req.params.fileName;
        const message = {
            fileName,
            messageBody: req.data.body
        };
        switch (FUNCTIONALITY) {
            case WRITE_OPERATION:
                await this.create(fileName, message);
                break;
            case UPDATE_OPERATION:
                await this.update(fileName, message);
                break;
            case READ_OPERATION:
                await this.read(fileName);
                break;
            case DELETE_OPERATION:
                await this.delete(fileName);
                break;
            default:
                console.log("ERROR");
                res.status(404).send("ERROR");
                break;
        }
        res.status(200).send("ok");
    },
};
exports.default = dbKernel;
