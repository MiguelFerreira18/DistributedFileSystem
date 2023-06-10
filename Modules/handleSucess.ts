import { logger } from "./logger";
import { logStruct } from "../models/loggerMessageModel";
import Message from "../models/FileSchema";

/**
 * Asynchronously handles successful events and logs them to the console
 *
 * @param {string} successName - The name of the successful event
 * @param {string} fileName - The name of the file that triggered the event
 * @param {Message} [data] - Optional additional data to log with the event
 */
const handleSuccess = async (
	successName: string,
	fileName: string,
	data?: Message
) => {
	const timeStamp = new Date().toISOString();
	const dataObject = data ? { FileName: fileName, Data: data } : undefined;

	switch (successName) {
		case "read":
			const readLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "read",
				DataObject: dataObject,
			};
			logger.warn(JSON.stringify(readLog));
			break;
		case "write":
			const writeLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "write",
				DataObject: dataObject,
			};
			logger.info(JSON.stringify(writeLog));
			break;
		case "update":
			const updateLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "update",
				DataObject: dataObject,
			};
			logger.info(JSON.stringify(updateLog));
			break;
		case "delete":
			const deleteLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "delete",
				DataObject: dataObject,
			};
			logger.info(JSON.stringify(deleteLog));
			break;
		case "send":
			const sendLog:logStruct= {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "send",
				DataObject: dataObject,
			};
			logger.info(JSON.stringify(sendLog));
			break;
		case "init":
			const initializingLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "init",
				DataObject: undefined,
			};
			logger.warn(JSON.stringify(initializingLog));
			break;
		case "receive":
			const receiveLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "receive",
				DataObject: dataObject,
			};
			logger.warn(JSON.stringify(receiveLog));
			break;
		default:
			logger.info("Success from " + fileName);
			break;
	}
};


export {handleSuccess}