import { logger } from "../config/logger";
import { join } from "path";
import conf from "../config/dbPardal.json";
import dbKernel from "../config/module";
import crypto from "crypto";
import { mySubServers, subServer } from "../src/subGroup";
import { handleSuccess } from "../Modules/handleSucess";
import { handleErrors } from "../Modules/handleErrors";

const folderPath = join(conf.home, conf.dbDir);

const WRITE_OPERATION = "write";
const READ_OPERATION = "read"
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
				handleSuccess("init", "none");
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

const readFile = async (req: any, res: any) => {
	//Apply message digest to the fileName
	const fileName = await createDigest(req.params.fileName);
	const filePath = join(folderPath, fileName);
	try {
		const data: string = await dbKernel.read(fileName);
		handleSuccess(READ_OPERATION, fileName, data);
		res.send(data);
	} catch (err) {
		console.log(err);
		handleErrors(READ_OPERATION, err, filePath);
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
		handleSuccess(WRITE_OPERATION, fileName, data);
		res.send("File created successfully");
	} catch (err) {
		console.log(err);
		handleErrors(WRITE_OPERATION, err, filePath);
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
		handleSuccess(UPDATE_OPERATION, fileName, data);
		res.send("File updated successfully");
	} catch (err) {
		console.log(err);
		handleErrors(UPDATE_OPERATION, err, filePath);
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
		handleSuccess(DELETE_OPERATION, filePath);
		res.send("File deleted successfully");
	} catch (err) {
		console.log(err);
		handleErrors(DELETE_OPERATION, err, filePath);
		res.status(500).send("Error deleting file");
	}
};
const receive = async (req: any, res: any) => {
	try {
		await dbKernel.receiveFile(req, res);
		handleSuccess("receive", req.data.body, req.params.fileName);
	} catch (error) {
		console.log(`Error in the action ${req.data.functionality} `);
		//HANDLE ERROR ON RECEIVING A FILE
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



const createDigest = async (fileName: string) => {
	return crypto.createHash("md5").update(fileName).digest("hex");
};
const findMyServer = async () => {
	return mySubServers.find((s) => s.serverAdress.includes(PORT.toString()));
};

export default {
	init,
	getPage,
	readFile,
	writeFile,
	updateFile,
	deleteFile,
	receive,
	groupServerStatus,
};
