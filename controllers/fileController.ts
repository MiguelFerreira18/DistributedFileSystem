import { join } from "path";
import conf from "../dbPardal.json";
import dbKernel from "../Modules/module";
import crypto from "crypto";
import { mySubServers } from "../src/subGroup";
import { handleSuccess } from "../Modules/handleSucess";
import { handleErrors } from "../Modules/handleErrors";
import Message from "../models/FileSchema";

const folderPath = join(conf.home, conf.dbDir);

const WRITE_OPERATION = "write";
const READ_OPERATION = "read";
const UPDATE_OPERATION = "update";
const DELETE_OPERATION = "delete";
const PORT = conf.PORT;

const getPage = (req: any, res: any) => {
	res.send("GET request to the homepage");
};


const readFile = async (req: any, res: any) => {
	//Apply message digest to the fileName
	const fileName = await createDigest(req.params.fileName);
	const filePath = join(folderPath, fileName);
	try {
		const data: string = await dbKernel.read(fileName);
		handleSuccess(READ_OPERATION, fileName);
		res.send(data);
	} catch (err) {
		handleErrors(READ_OPERATION, err, filePath);
		res.status(500).send("Error reading file");
	}
};

const writeFile = async (req: any, res: any) => {
	const fileName = req.params.fileName;
	const filePath = join(folderPath, fileName);
	const jsonStructure: Message = {
		fileName,
		messageBody: req.body.messageBody,
	};

	// Find my server
	const myServer = await findMyServer();
	if (myServer?.isLeader)
		await dbKernel.gossip(fileName, WRITE_OPERATION, jsonStructure); //SE FOR O LIDER MANDA PARA TODOS

	const md5 = await createDigest(fileName);
	try {
		await dbKernel.create(md5, jsonStructure);
		handleSuccess(WRITE_OPERATION, fileName, jsonStructure);
		res.send("File created successfully");
	} catch (err) {
		console.log(err);
		handleErrors(WRITE_OPERATION, err, filePath);
		res.status(500).send("Error writing file");
	}
};

const updateFile = async (req: any, res: any) => {
	const fileName = req.params.fileName;
	const filePath = join(folderPath, fileName);
	const jsonStructure: Message = {
		fileName: req.params.fileName,
		messageBody: req.body.messageBody,
	};

	const myServer = await findMyServer();
	if (myServer?.isLeader)
		await dbKernel.gossip(fileName, UPDATE_OPERATION, jsonStructure);

	const md5 = await createDigest(fileName);
	try {
		// Find my server
		await dbKernel.update(md5, jsonStructure);
		handleSuccess(UPDATE_OPERATION, fileName, jsonStructure);
		res.send("File updated successfully");
	} catch (err) {
		console.log(err);
		handleErrors(UPDATE_OPERATION, err, filePath);
		res.status(500).send("Error updating file");
	}
};

const deleteFile = async (req: any, res: any) => {
	const fileName = req.params.fileName;
	const filePath = join(folderPath, fileName);

	// Find my server
	const myServer = await findMyServer();
	if (myServer?.isLeader)
		await dbKernel.gossip(req.params.fileName, DELETE_OPERATION);

	const md5 = await createDigest(fileName)
	try {
		await dbKernel.delete(md5);
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
		handleSuccess("receive", req.body.body, req.params.fileName);
	} catch (error) {
		console.log(`Error in the action ${req.bod.functionality} `);
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
	console.log("searching");
	console.log();
	const server = await mySubServers.find((s) => {
		console.log(s);
		console.log(s.serverAdress.includes(PORT.toString()));
		return s.serverAdress.includes(PORT.toString());
	});
	console.log(`23 ${server?.isLeader}`);
	return server;
};



export default {
	getPage,
	readFile,
	writeFile,
	updateFile,
	deleteFile,
	receive,
	groupServerStatus,
};
