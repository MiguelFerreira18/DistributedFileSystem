"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subGroup_1 = require("../src/subGroup");
const axios_1 = __importDefault(require("axios"));
const logs_1 = __importDefault(require("../src/logs"));
const fs_1 = require("fs");
const recuperateActions_1 = require("../Modules/recuperateActions");
const PORT = process.env.PORT || 8080;
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
//!MUDAR ISTO DE SITIO ISTO É FEITO AO LIGAR
const retreiveLogs = async (req, res) => {
    subGroup_1.mySubServers.forEach(async (element) => {
        try {
            if (element.serverAdress.search(PORT.toString()) < 0) {
                const log = await axios_1.default.get(`${element.serverAdress}/logs/read`);
                logs_1.default.push(log.data);
            }
        }
        catch (err) {
            console.log(err);
            //!METER AQUI O LOGGER
        }
    });
    try {
        await (0, recuperateActions_1.replicateFromLogs)();
    }
    catch (err) {
        console.log(err);
        //!METER AQUI O LOGGER
    }
};
exports.default = { receiveLog };
