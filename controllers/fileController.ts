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


/**
 * Asynchronously reads a file and sends its content as a response.
 *
 * @param {any} req - The request object.
 * @param {any} res - The response object.
 * @return {Promise<void>} A promise that resolves when the file is read and sent 
 * as a response or rejects if there was an error reading the file.
 */
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

/**
 * Asynchronously writes a file with the given fileName and messageBody in the request body.
 * If the server is a leader, it sends the file to all servers in the cluster. 
 * Creates a digest of the file and stores it in the database. 
 * If successful, sends a success message and returns "File created successfully".
 * If there is an error, logs it and sends a 500 status with the message "Error writing file".
 *
 * @param {any} req - the request object containing the fileName and messageBody
 * @param {any} res - the response object to send back
 * @return {Promise<void>} a promise that resolves when the file is successfully written to disk and stored in the database
 */
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

/**
 * Updates a file with a given name and message body, and sends a gossip message to the database 
 * if the current server is the leader. Returns a success message upon completion or an error message
 * if an error is encountered.
 *
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @return {Promise<void>} - a Promise resolving to void
 */
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

/**
 * Deletes a file specified in the request parameters. If the server is the leader,
 * the operation is gossiped to the other nodes. Deletes the file from the database
 * and responds with a success message if the operation is successful, otherwise
 * logs the error and responds with an error message.
 *
 * @param {any} req - The request object containing the file name to be deleted.
 * @param {any} res - The response object.
 * @return {Promise<void>} - Returns a promise that resolves once the operation is completed.
 */
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
/**
 * Receives a file through the request and sends it to the database.
 *
 * @param {any} req - the request object containing the file to be received
 * @param {any} res - the response object to be used for sending status and error messages
 * @return {Promise<void>} - a promise that resolves when the file is received and handled successfully
 */
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

/**
 * Executes the 'groupServerStatus' function asynchronously. 
 *
 * @async
 * @function groupServerStatus
 * @param {any} req - The request object.
 * @param {any} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with no value.
 * @throws Will throw an error if there is an issue while getting the group server status.
 */
const groupServerStatus = async (req: any, res: any) => {
	try {
		await dbKernel.groupServerStatus();
		res.send("have a good one");
	} catch (err) {
		console.log(err);
		res.status(500).send("Error getting group server status");
	}
};

/**
 * Computes the MD5 hash digest of the given file name string asynchronously.
 *
 * @param {string} fileName - The name of the file to compute the hash for.
 * @return {Promise<string>} A promise that resolves to the hex string representation of the hash digest.
 */
const createDigest = async (fileName: string) => {
	return crypto.createHash("md5").update(fileName).digest("hex");
};
/**
 * Asynchronously searches for a server that includes the specified port in its address.
 *
 * @return {Promise<SubServer | undefined>} The server found or undefined if none was found.
 */
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
