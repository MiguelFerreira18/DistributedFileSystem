"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
let dbKernel;
//let conf = {};
let home;
let dbDir;
dbKernel = {
    init: function (conf) {
        home = conf.home;
        dbDir = path_1.default.join(home, conf.dbDir);
    },
    create: function (params) {
        // implementation for create method
    },
};
exports.default = dbKernel;
