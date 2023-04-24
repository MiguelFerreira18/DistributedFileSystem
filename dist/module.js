"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPardal_json_1 = __importDefault(require("./dbPardal.json"));
let dbKernel;
let home;
let dbDir;
dbKernel = {
    init: function () {
        home = dbPardal_json_1.default.home;
        dbDir = path_1.default.join(home, dbPardal_json_1.default.dbDir);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir);
            console.log(`Directory ${dbDir} created successfully.`);
        }
        let routesDir = path_1.default.join(home, dbPardal_json_1.default.routesDir);
        if (!fs_1.default.existsSync(routesDir)) {
            fs_1.default.mkdirSync(routesDir);
            console.log(`Directory ${routesDir} created successfully.`);
        }
    },
    create: function (params) {
    },
};
exports.default = dbKernel;
