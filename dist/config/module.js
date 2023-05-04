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
let dbKernel;
let home;
let dbDir;
const folderPath = (0, path_2.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const appendFileAsync = (0, util_1.promisify)(fs_1.default.appendFile);
const deleteFileAsync = (0, util_1.promisify)(fs_1.default.unlink);
dbKernel = {
    init: async function (groupHash) {
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
            console.log("was group");
            console.log(group);
            return true;
        }
        return false;
    },
    create: async function (fileName, data) {
        const filePath = (0, path_2.join)(folderPath, fileName);
        await appendFileAsync(filePath, data, "utf-8");
    },
    update: async function (fileName, data) {
        const filePath = (0, path_2.join)(folderPath, fileName);
        await writeFileAsync(filePath, JSON.stringify(data), "utf-8");
    },
    read: async function (fileName) {
        const filePath = (0, path_2.join)(folderPath, fileName);
        const data = await readFileAsync(filePath, "utf-8");
        const jsonData = JSON.parse(data);
        return jsonData;
    },
    delete: async function (fileName) {
        const filePath = (0, path_2.join)(folderPath, fileName);
        await deleteFileAsync(filePath);
    },
    groupServerStatus: async function () {
        //use console.table to make a good table with the groupMap hashTable
        await console.log(groups_1.groupMap);
    }
};
exports.default = dbKernel;
