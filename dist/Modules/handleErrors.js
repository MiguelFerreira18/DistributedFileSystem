"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
const logger_1 = require("../config/logger");
const handleErrors = async (errorName, err, errorLocation, filePath) => {
    switch (errorName) {
        case "read":
            logger_1.logger.error("Error reading file " + err + " from " + filePath);
            break;
        case "write":
            logger_1.logger.error("Error writing file " + err + " from " + filePath);
            break;
        case "update":
            logger_1.logger.error("Error updating file " + err + " from " + filePath);
            break;
        case "delete":
            logger_1.logger.error("Error deleting file " + err + " from " + filePath);
            break;
        case "reach":
            logger_1.logger.error(`Error in line ${errorLocation}: Problem reaching the server`);
            break;
        case "action":
            logger_1.logger.error(`Error in line ${errorLocation}: doing one of the CRUD actions `);
            break;
        case "replicateFromLogs":
            logger_1.logger.error(`Error in line ${errorLocation}: Problem replicating logs`);
            break;
        case "electLeader":
            logger_1.logger.error(`Error in line ${errorLocation}: Electing the leader`);
            break;
        case "retreiveLogsAxios":
            logger_1.logger.error(`Error in line ${errorLocation}: Problem retreiving logs`);
            break;
        case "retreiveLogsfunction":
            logger_1.logger.error(`Error in line ${errorLocation}: Problem retreiving logs`);
            break;
        case "callSubServer":
            logger_1.logger.error(`Error in line ${errorLocation}: Problem calling the sub server`);
            break;
        default:
            logger_1.logger.error("Error " + err + " from " + filePath);
            break;
    }
};
exports.handleErrors = handleErrors;
