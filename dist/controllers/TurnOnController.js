"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const receiveLog = async (req, res) => {
    //get the latest log from te /logs folder
    const combinedFile = (0, fs_1.readFileSync)("../logs/combined.log", "utf-8");
    let logLineData = [];
    combinedFile.split(/\r?\n/).forEach((line) => {
        let lineSplit = [];
        lineSplit = line.split("|");
        if (lineSplit[1] === "info") {
            logLineData.push(JSON.parse(lineSplit[2]));
        }
    });
    res.send(logLineData);
};
exports.default = { receiveLog };
