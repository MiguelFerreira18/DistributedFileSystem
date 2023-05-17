"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const path_2 = require("path");
const util_1 = require("util");
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const groups_1 = require("../src/groups");
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const axios_1 = __importDefault(require("axios"));
let dbKernel;
let home;
let dbDir;
const folderPath = (0, path_2.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const appendFileAsync = (0, util_1.promisify)(fs_1.default.appendFile);
const deleteFileAsync = (0, util_1.promisify)(fs_1.default.unlink);
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
    sendFile: async function (fileName, body, destNode) {
        //Mudar quando se conseguir fazer a reverse proxy
        //const url = `${destNode.server}/file/write/${fileName}`;
        const url = `http://${destNode.server}/write/${fileName}`;
        (0, axios_1.default)({
            method: "post",
            url: url,
            data: { body },
        });
    },
    create: async function (fileName, data) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        await appendFileAsync(filePath, data, "utf-8");
    },
    update: async function (fileName, data) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        await writeFileAsync(filePath, JSON.stringify(data), "utf-8");
    },
    read: async function (fileName) {
        console.log("err");
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        console.log("err2");
        console.log(filePath);
        const data = await readFileAsync(filePath, "utf-8");
        console.log("err3");
        const jsonData = JSON.parse(data);
        console.log("err4");
        return jsonData;
    },
    delete: async function (fileName) {
        const filePath = (0, path_2.join)(folderPath, fileName + ".json");
        await deleteFileAsync(filePath);
    },
    groupServerStatus: async function () {
        await console.log(groups_1.groupMap);
    },
    announceLeader: async function (req, res) {
        //Quando o server é iniciado ele manda uma request para o outro servidor do mesmo cluster e manda o seu int
        //O outro server recebe e compara com o seu int e se for maior e decide se é ou não o novo lider
    },
};
exports.default = dbKernel;
