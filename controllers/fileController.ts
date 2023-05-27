import { logger } from "../config/logger";
import { join } from "path";
import conf from "../config/dbPardal.json";
import dbKernel from "../config/module";
import crypto from "crypto";
import { error } from "console";
import { chooseNode, groupNodeReturn } from "../Modules/chooseServer";
import { mySubServers, subServer } from "../src/subGroup";
import { logStruct } from "../models/loggerMessageModel";

const folderPath = join(conf.home, conf.dbDir);

const WRITE_OPERATION = "write";
const UPDATE_OPERATION = "update";
const DELETE_OPERATION = "delete";
const SEND_OPERATION = "send";
const PORT = process.env.PORT || 8080;

const getPage = (req: any, res: any) => {
	res.send("GET request to the homepage");
};

const init = (req: any, res: any) => {
	try {
		console.log("Initializing file system");
		console.log("Group hash: " + req.params.groupHash);
		dbKernel.init(req.params.groupHash, req.body.server).then((isGroup) => {
			if (isGroup) {
				console.log("Group is initialized");
				handleSuccess(6, "none");
				res.send("Group is initialized");
			} else {
				console.log("Group is not initialized");
				res.send("Group is not initialized");
			}
		});
	} catch (err) {
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

const readFile = async (req: any, res: any) => {
	//Apply message digest to the fileName
	const fileName = await createDigest(req.params.fileName);
	const filePath = join(folderPath, fileName);
	try {
		const data: string = await dbKernel.read(fileName);
		handleSuccess(1, fileName, data);
		res.send(data);
	} catch (err) {
		console.log(err);
		handleErrors(1, err, filePath);
		res.status(500).send("Error reading file");
	}
};

const writeFile = async (req: any, res: any) => {
	const fileName = req.params.fileName;
	const filePath = join(folderPath, fileName);
	const data: string = JSON.stringify(req.body);

	// Find my server
	const myServer = await findMyServer();
	if (myServer?.isLeader)
		await dbKernel.gossip(fileName, data, WRITE_OPERATION);

	const md5 = createDigest(fileName);
	try {
		await dbKernel.create(md5, data);
		handleSuccess(2, fileName, data);
		res.send("File created successfully");
	} catch (err) {
		console.log(err);
		handleErrors(2, err, filePath);
		res.status(500).send("Error writing file");
	}
};

const updateFile = async (req: any, res: any) => {
	const fileName = await createDigest(req.params.fileName);
	const filePath = join(folderPath, fileName);
	const data: string = JSON.stringify(req.body);

	try {
		// Find my server
		const myServer = await findMyServer();
		if (myServer?.isLeader)
			await dbKernel.gossip(fileName, data, UPDATE_OPERATION);

		await dbKernel.update(fileName, data);
		handleSuccess(3, fileName, data);
		res.send("File updated successfully");
	} catch (err) {
		console.log(err);
		handleErrors(3, err, filePath);
		res.status(500).send("Error updating file");
	}
};

const deleteFile = async (req: any, res: any) => {
	const fileName = await createDigest(req.params.fileName);
	const filePath = join(folderPath, fileName);
	try {
		// Find my server
		const myServer = await findMyServer();
		if (myServer?.isLeader)
			await dbKernel.gossip(fileName, "", DELETE_OPERATION);
		await dbKernel.delete(fileName);
		handleSuccess(4, filePath);
		res.send("File deleted successfully");
	} catch (err) {
		console.log(err);
		handleErrors(4, err, filePath);
		res.status(500).send("Error deleting file");
	}
};
const receive = async (req: any, res: any) => {
	try {
		await dbKernel.receiveFile(req, res);
		handleSuccess(7,req.data.body,req.params.fileName);
	} catch (error) {
		console.log(`Error in the action ${req.data.functionality} `);
		res.status(400).send("ERROR in receiving file");
	}
};

const groupServerStatus = async (req: any, res: any) => {
	try {
		await dbKernel.groupServerStatus();
		res.send("have a good one");
	} catch (err) {
		console.log(err);
		res.status(500).send("Error getting group server status");
	}
};
const handleErrors = async (
	errorLevel: number,
	err: unknown,
	filePath: string
) => {
	switch (errorLevel) {
		case 1:
			logger.error("Error reading file " + err + " from " + filePath);
			break;
		case 2:
			logger.error("Error writing file " + err + " from " + filePath);
			break;
		case 3:
			logger.error("Error updating file " + err + " from " + filePath);
			break;
		case 4:
			logger.error("Error deleting file " + err + " from " + filePath);
			break;
		default:
			logger.error("Error " + err + " from " + filePath);
			break;
	}
};

const handleSuccess = async (
	successLevel: number,
	fileName: string,
	data?: string
) => {
	switch (successLevel) {
		case 1:
			let readLog: logStruct;
			readLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "read",
				DataObject: {
					FileName: fileName,
					Data: data,
				},
			};
			logger.info(readLog);
			break;
		case 2:
			let writeLog: logStruct;
			writeLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "write",
				DataObject: {
					FileName: fileName,
					Data: data,
				},
			};

			logger.info(writeLog);
			break;
		case 3:
			let updateLog: logStruct;
			updateLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "update",
				DataObject: {
					FileName: fileName,
					Data: data,
				},
			};
			logger.info(updateLog);
			break;
		case 4:
			let deleteLog: logStruct;
			deleteLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "delete",
				DataObject: {
					FileName: fileName,
					Data: data,
				},
			};
			logger.info(deleteLog);
			break;
		case 5:
			let sendLog: logStruct;
			sendLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "send",
				DataObject: {
					FileName: fileName,
					Data: data,
				},
			};
			logger.info(sendLog);
		case 6:
			let initializingLog: logStruct;
			initializingLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "init",
				DataObject: undefined,
			};
			logger.warn(initializingLog);
		case 7:
			let receiveLog:logStruct;
			receiveLog = {
				TimeStamp: new Date().toISOString(),
				LogType: "success",
				Action: "receive",
				DataObject: {
					FileName: fileName,
					Data: data,
				},
			};
			logger.warn(receiveLog);
		default:
			logger.info("Success from " + fileName);
			break;
	}
};

const createDigest = async (fileName: string) => {
	return crypto.createHash("md5").update(fileName).digest("hex");
};
const findMyServer = async () => {
	return mySubServers.find((s) => s.serverAdress.includes(PORT.toString()));
};

export default {
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
