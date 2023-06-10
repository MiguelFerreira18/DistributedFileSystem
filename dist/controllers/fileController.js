"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dbPardal_json_1 = __importDefault(require("../dbPardal.json"));
const module_1 = __importDefault(require("../Modules/module"));
const crypto_1 = __importDefault(require("crypto"));
const subGroup_1 = require("../src/subGroup");
const handleSucess_1 = require("../Modules/handleSucess");
const handleErrors_1 = require("../Modules/handleErrors");
const folderPath = (0, path_1.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const WRITE_OPERATION = "write";
const READ_OPERATION = "read";
const UPDATE_OPERATION = "update";
const DELETE_OPERATION = "delete";
const PORT = dbPardal_json_1.default.PORT;
const getPage = (req, res) => {
    res.send("GET request to the homepage");
};
const readFile = async (req, res) => {
    //Apply message digest to the fileName
    const fileName = await createDigest(req.params.fileName);
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        const data = await module_1.default.read(fileName);
        (0, handleSucess_1.handleSuccess)(READ_OPERATION, fileName);
        res.send(data);
    }
    catch (err) {
        (0, handleErrors_1.handleErrors)(READ_OPERATION, err, filePath);
        res.status(500).send("Error reading file");
    }
};
const writeFile = async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const jsonStructure = {
        fileName,
        messageBody: req.body.messageBody,
    };
    // Find my server
    const myServer = await findMyServer();
    if (myServer?.isLeader)
        await module_1.default.gossip(fileName, WRITE_OPERATION, jsonStructure); //SE FOR O LIDER MANDA PARA TODOS
    const md5 = await createDigest(fileName);
    try {
        await module_1.default.create(md5, jsonStructure);
        (0, handleSucess_1.handleSuccess)(WRITE_OPERATION, fileName, jsonStructure);
        res.send("File created successfully");
    }
    catch (err) {
        console.log(err);
        (0, handleErrors_1.handleErrors)(WRITE_OPERATION, err, filePath);
        res.status(500).send("Error writing file");
    }
};
const updateFile = async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const jsonStructure = {
        fileName: req.params.fileName,
        messageBody: req.body.messageBody,
    };
    const myServer = await findMyServer();
    if (myServer?.isLeader)
        await module_1.default.gossip(fileName, UPDATE_OPERATION, jsonStructure);
    const md5 = await createDigest(fileName);
    try {
        // Find my server
        await module_1.default.update(md5, jsonStructure);
        (0, handleSucess_1.handleSuccess)(UPDATE_OPERATION, fileName, jsonStructure);
        res.send("File updated successfully");
    }
    catch (err) {
        console.log(err);
        (0, handleErrors_1.handleErrors)(UPDATE_OPERATION, err, filePath);
        res.status(500).send("Error updating file");
    }
};
const deleteFile = async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = (0, path_1.join)(folderPath, fileName);
    // Find my server
    const myServer = await findMyServer();
    if (myServer?.isLeader)
        await module_1.default.gossip(req.params.fileName, DELETE_OPERATION);
    const md5 = await createDigest(fileName);
    try {
        await module_1.default.delete(md5);
        (0, handleSucess_1.handleSuccess)(DELETE_OPERATION, filePath);
        res.send("File deleted successfully");
    }
    catch (err) {
        console.log(err);
        (0, handleErrors_1.handleErrors)(DELETE_OPERATION, err, filePath);
        res.status(500).send("Error deleting file");
    }
};
const receive = async (req, res) => {
    try {
        await module_1.default.receiveFile(req, res);
        (0, handleSucess_1.handleSuccess)("receive", req.body.body, req.params.fileName);
    }
    catch (error) {
        console.log(`Error in the action ${req.bod.functionality} `);
        //HANDLE ERROR ON RECEIVING A FILE
        res.status(400).send("ERROR in receiving file");
    }
};
const groupServerStatus = async (req, res) => {
    try {
        await module_1.default.groupServerStatus();
        res.send("have a good one");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error getting group server status");
    }
};
const createDigest = async (fileName) => {
    return crypto_1.default.createHash("md5").update(fileName).digest("hex");
};
const findMyServer = async () => {
    console.log("searching");
    console.log();
    const server = await subGroup_1.mySubServers.find((s) => {
        console.log(s);
        console.log(s.serverAdress.includes(PORT.toString()));
        return s.serverAdress.includes(PORT.toString());
    });
    console.log(`23 ${server?.isLeader}`);
    return server;
};
exports.default = {
    getPage,
    readFile,
    writeFile,
    updateFile,
    deleteFile,
    receive,
    groupServerStatus,
};
