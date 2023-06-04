"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSuccess = void 0;
const logger_1 = require("../config/logger");
const handleSuccess = async (successName, fileName, data) => {
    const timeStamp = new Date().toISOString();
    const dataObject = data ? { FileName: fileName, Data: data } : undefined;
    switch (successName) {
        case "read":
            const readLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "read",
                DataObject: dataObject,
            };
            logger_1.logger.warn(JSON.stringify(readLog));
            break;
        case "write":
            const writeLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "write",
                DataObject: dataObject,
            };
            logger_1.logger.info(JSON.stringify(writeLog));
            break;
        case "update":
            const updateLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "update",
                DataObject: dataObject,
            };
            logger_1.logger.info(JSON.stringify(updateLog));
            break;
        case "delete":
            const deleteLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "delete",
                DataObject: dataObject,
            };
            logger_1.logger.info(JSON.stringify(deleteLog));
            break;
        case "send":
            const sendLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "send",
                DataObject: dataObject,
            };
            logger_1.logger.info(JSON.stringify(sendLog));
            break;
        case "init":
            const initializingLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "init",
                DataObject: undefined,
            };
            logger_1.logger.warn(JSON.stringify(initializingLog));
            break;
        case "receive":
            const receiveLog = {
                TimeStamp: timeStamp,
                LogType: "success",
                Action: "receive",
                DataObject: dataObject,
            };
            logger_1.logger.warn(JSON.stringify(receiveLog));
            break;
        default:
            logger_1.logger.info("Success from " + fileName);
            break;
    }
};
exports.handleSuccess = handleSuccess;
