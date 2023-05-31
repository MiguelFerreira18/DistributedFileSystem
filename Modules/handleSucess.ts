import { logger } from "../config/logger";
import { logStruct } from "../models/loggerMessageModel";
import Message from "../models/FileSchema";

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
			logger.warn(readLog);
			break;
		case "write":
			const writeLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "write",
				DataObject: dataObject,
			};
			logger.info(writeLog);
			break;
		case "update":
			const updateLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "update",
				DataObject: dataObject,
			};
			logger.info(updateLog);
			break;
		case "delete":
			const deleteLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "delete",
				DataObject: dataObject,
			};
			logger.info(deleteLog);
			break;
		case "send":
			const sendLog:logStruct= {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "send",
				DataObject: dataObject,
			};
			logger.info(sendLog);
			break;
		case "init":
			const initializingLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "init",
				DataObject: undefined,
			};
			logger.warn(initializingLog);
			break;
		case "receive":
			const receiveLog:logStruct = {
				TimeStamp: timeStamp,
				LogType: "success",
				Action: "receive",
				DataObject: dataObject,
			};
			logger.warn(receiveLog);
			break;
		default:
			logger.info("Success from " + fileName);
			break;
	}
};


export {handleSuccess}