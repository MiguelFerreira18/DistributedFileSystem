"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../config/logger");
const path_1 = require("path");
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const module_1 = __importDefault(require("../config/module"));
const crypto_1 = __importDefault(require("crypto"));
const subGroup_1 = require("../src/subGroup");
const folderPath = (0, path_1.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const WRITE_OPERATION = "write";
const UPDATE_OPERATION = "update";
const DELETE_OPERATION = "delete";
const SEND_OPERATION = "send";
const PORT = process.env.PORT || 8080;
const getPage = (req, res) => {
    res.send("GET request to the homepage");
};
const init = (req, res) => {
    try {
        console.log("Initializing file system");
        console.log("Group hash: " + req.params.groupHash);
        module_1.default.init(req.params.groupHash, req.body.server).then((isGroup) => {
            if (isGroup) {
                console.log("Group is initialized");
                handleSuccess(6, "none");
                res.send("Group is initialized");
            }
            else {
                console.log("Group is not initialized");
                res.send("Group is not initialized");
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error initializing file system");
    }
};
// const sendFile = async (req: any, res: any) => {
// 	const fileName = req.params.fileName;
// 	const filePath = join(folderPath, fileName);
// 	try {
// 		const data: string = JSON.stringify(req.body);
// 		await dbKernel.gossip(fileName, data, SEND_OPERATION);
// 		//Mudar estes Handlers
// 		handleSuccess(5, fileName, data);
// 		const jsonData = JSON.parse(data);
// 		res.send(jsonData);
// 	} catch (err) {
// 		console.log(err);
// 		handleErrors(1, err, filePath);
// 		res.status(500).send("Error reading file");
// 	}
// };
const readFile = async (req, res) => {
    //Apply message digest to the fileName
    const fileName = await createDigest(req.params.fileName);
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        const data = await module_1.default.read(fileName);
        handleSuccess(1, fileName, data);
        res.send(data);
    }
    catch (err) {
        console.log(err);
        handleErrors(1, err, filePath);
        res.status(500).send("Error reading file");
    }
};
const writeFile = async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    // Find my server
    const myServer = await findMyServer();
    if (myServer?.isLeader)
        await module_1.default.gossip(fileName, data, WRITE_OPERATION);
    const md5 = createDigest(fileName);
    try {
        await module_1.default.create(md5, data);
        handleSuccess(2, fileName, data);
        res.send("File created successfully");
    }
    catch (err) {
        console.log(err);
        handleErrors(2, err, filePath);
        res.status(500).send("Error writing file");
    }
};
const updateFile = async (req, res) => {
    const fileName = await createDigest(req.params.fileName);
    const filePath = (0, path_1.join)(folderPath, fileName);
    const data = JSON.stringify(req.body);
    try {
        // Find my server
        const myServer = await findMyServer();
        if (myServer?.isLeader)
            await module_1.default.gossip(fileName, data, UPDATE_OPERATION);
        await module_1.default.update(fileName, data);
        handleSuccess(3, fileName, data);
        res.send("File updated successfully");
    }
    catch (err) {
        console.log(err);
        handleErrors(3, err, filePath);
        res.status(500).send("Error updating file");
    }
};
const deleteFile = async (req, res) => {
    const fileName = await createDigest(req.params.fileName);
    const filePath = (0, path_1.join)(folderPath, fileName);
    try {
        // Find my server
        const myServer = await findMyServer();
        if (myServer?.isLeader)
            await module_1.default.gossip(fileName, "", DELETE_OPERATION);
        await module_1.default.delete(fileName);
        handleSuccess(4, filePath);
        res.send("File deleted successfully");
    }
    catch (err) {
        console.log(err);
        handleErrors(4, err, filePath);
        res.status(500).send("Error deleting file");
    }
};
const receive = async (req, res) => {
    try {
        await module_1.default.receiveFile(req, res);
        handleSuccess(7, req.data.body, req.params.fileName);
    }
    catch (error) {
        console.log(`Error in the action ${req.data.functionality} `);
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
const handleErrors = async (errorLevel, err, filePath) => {
    switch (errorLevel) {
        case 1:
            logger_1.logger.error("Error reading file " + err + " from " + filePath);
            break;
        case 2:
            logger_1.logger.error("Error writing file " + err + " from " + filePath);
            break;
        case 3:
            logger_1.logger.error("Error updating file " + err + " from " + filePath);
            break;
        case 4:
            logger_1.logger.error("Error deleting file " + err + " from " + filePath);
            break;
        default:
            logger_1.logger.error("Error " + err + " from " + filePath);
            break;
    }
};
const handleSuccess = async (successLevel, fileName, data) => {
    const timeStamp = new Date().toISOString();
    const dataObject = data ? { FileName: fileName, Data: data } : undefined;
    switch (successLevel) {
        case 1:
            const readLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "read",
                DataObject: dataObject,
            };
            logger_1.logger.warn(readLog);
            break;
        case 2:
            const writeLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "write",
                DataObject: dataObject,
            };
            logger_1.logger.info(writeLog);
            break;
        case 3:
            const updateLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "update",
                DataObject: dataObject,
            };
            logger_1.logger.info(updateLog);
            break;
        case 4:
            const deleteLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "delete",
                DataObject: dataObject,
            };
            logger_1.logger.info(deleteLog);
            break;
        case 5:
            const sendLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "send",
                DataObject: dataObject,
            };
            logger_1.logger.info(sendLog);
            break;
        case 6:
            const initializingLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "init",
                DataObject: undefined,
            };
            logger_1.logger.warn(initializingLog);
            break;
        case 7:
            const receiveLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "receive",
                DataObject: dataObject,
            };
            logger_1.logger.warn(receiveLog);
            break;
        default:
            logger_1.logger.info("Success from " + fileName);
            break;
    }
};
const createDigest = async (fileName) => {
    return crypto_1.default.createHash("md5").update(fileName).digest("hex");
};
const findMyServer = async () => {
    return subGroup_1.mySubServers.find((s) => s.serverAdress.includes(PORT.toString()));
};
exports.default = {
    init,
    //sendFile,
    getPage,
    readFile,
    writeFile,
    updateFile,
    deleteFile,
    receive,
    groupServerStatus,
};
