"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const readLog = async (req, res) => {
    //get the latest log from te /logs folder
    console.log("Into logs");
    const logsFilePath = path_1.default.join(dbPardal_json_1.default.home, "logs", "combined.log");
    console.log(logsFilePath);
    const combinedFile = (0, fs_1.readFileSync)(logsFilePath, "utf-8");
    let logLineData = [];
    combinedFile.split(/\r?\n/).forEach((line) => {
        if (line === "") {
            return;
        }
        line.trim();
        let lineSplit = [];
        lineSplit = line.split("|");
        console.log("MY SPLIT>>>> " + lineSplit.length + "\n");
        if (lineSplit[1].includes("info")) {
            logLineData.push(JSON.parse(lineSplit[2]));
            console.log(lineSplit[2]);
        }
    });
    console.log("end of logs");
    res.send(logLineData);
};
exports.default = { readLog };
