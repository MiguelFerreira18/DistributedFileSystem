import fs, {
	appendFileSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "fs";
import path from "path";
import { join } from "path";
import conf from "../dbPardal.json";
import { groupMap} from "../src/groups";
import proxy from "express-http-proxy";
import axios from "axios";
import { mySubServers } from "../src/subGroup";
import Message from "../models/FileSchema";
import crypto from "crypto";

let dbKernel: DbKernel;

let home;
let dbDir;

const folderPath = join(conf.home, conf.dbDir);

const WRITE_OPERATION = "write";
const UPDATE_OPERATION = "update";
const READ_OPERATION = "read";
const DELETE_OPERATION = "delete";
const SEND_OPERATION = "send";

interface DbKernel {
	init: (groupHash: string, server: string) => Promise<boolean>;
	gossip: (
		fileName: string,
		functionality: string,
		body?: Message
	) => Promise<void>;
	create: (fileName: any, data: Message) => Promise<void>;
	update: (fileName: any, data: Message) => Promise<void>;
	read: (fileName: any) => Promise<string>;
	delete: (params: any) => Promise<void>;
	groupServerStatus: () => Promise<void>;
	receiveFile: (req: any, res: any) => Promise<void>;
}

dbKernel = {
	/**
	 * Initializes a group with the given groupHash and server.
	 *
	 * @param {string} groupHash - The unique identifier for the group.
	 * @param {string} server - The server to connect the group to.
	 * @return {Promise<boolean>} True if the group was successfully initialized, false otherwise.
	 */
	init: async function (groupHash: string, server: string) {
		home = conf.home;

		//File DB Dir
		dbDir = path.join(home, conf.dbDir);
		if (!fs.existsSync(dbDir)) {
			fs.mkdirSync(dbDir);
			console.log(`Directory ${dbDir} created successfully.`);
		}
		//check if the groupHash is in the groupMap and if it is check it to is active true
		if (groupMap.has(groupHash)) {
			const group: any = groupMap.get(groupHash);
			group.isActive = true;
			group.server = server;
			group.proxy = proxy(group.server);
			console.log("was group");
			console.log(group);
			return true;
		}
		return false;
	},
	/**
	 * Sends a message containing a file to all subservers, except the one running on the same port as the main server.
	 *
	 * @param {string} fileName - The name of the file to send.
	 * @param {string} functionality - A string describing the functionality of the file.
	 * @param {Message} [body] - An optional message to send with the file.
	 */
	gossip: async function (
		fileName: string,
		functionality: string,
		body?: Message
	) {
		console.log("Check")
		console.log(body)

		mySubServers.forEach(async (element) => {
			console.log(element)
			if (element.serverAdress.search(conf.PORT.toString())<0) {
				const url = `${element.serverAdress}file/receive/${fileName}`;
				await axios.post(url, {
					body,
					functionality,
				});
				console.log("end")
			}
		});
	},
	/**
	 * Writes a JSON file with the given file name and message body at the specified folder path.
	 *
	 * @param {any} fileName - the name of the file to create.
	 * @param {Message} messageBody - the message body to write to the file.
	 * @return {Promise<void>} - a Promise that resolves when the file is written successfully.
	 */
	create: async function (fileName: any, messageBody: Message) {
		const filePath = join(folderPath, fileName + ".json");
	
		await writeFileSync(filePath, JSON.stringify(messageBody), "utf-8");
	},
	/**
	 * Asynchronously updates a JSON file with the given messageBody.
	 *
	 * @param {any} fileName - The name of the file to update.
	 * @param {Message} messageBody - The message body to store in the file.
	 */
	update: async function (fileName: any, messageBody: Message) {
		const filePath = join(folderPath, fileName + ".json");


		await writeFileSync(filePath, JSON.stringify(messageBody), "utf-8");
	},
	/**
	 * Asynchronously reads a JSON file from a given file path and returns its message body.
	 *
	 * @param {any} fileName - the name of the JSON file to read
	 * @return {string} the message body of the JSON file as a string
	 */
	read: async function (fileName: any) {
		const filePath = join(folderPath, fileName + ".json");
		const data: string = await readFileSync(filePath, "utf-8");
		const jsonData:Message = JSON.parse(data);
		return jsonData.messageBody;
	},
	/**
	 * Deletes a file at the given file name.
	 *
	 * @param {any} fileName - The name of the file to delete.
	 * @return {Promise<void>} A promise that resolves when the file is deleted.
	 */
	delete: async function (fileName: any) {
		const filePath = join(folderPath, fileName + ".json");
		await unlinkSync(filePath);
	},
	/**
	 * Asynchronously logs groupMap to the console.
	 *
	 * @return {Promise<void>} Promise that resolves with no value
	 */
	groupServerStatus: async function () {
		await console.log(groupMap);
	},
/**
 * Asynchronously receives a file and performs one of several operations based on the functionality specified in the request body. 
 *
 * @param {any} req - the request object containing the file and functionality information.
 * @param {any} res - the response object to send status information.
 * @return {Promise<void>} - a promise indicating that the function has completed.
 */
	receiveFile: async function (req: any, res: any) {
		console.log(req.data)
		const FUNCTIONALITY = req.body.functionality;
		const fileName = req.params.fileName;
		const message:Message = {
			fileName,
			messageBody: req.body.body
		};
		const md5 = await createDigest(fileName);
		switch (FUNCTIONALITY) {
			case WRITE_OPERATION:
				
				await this.create(md5, message);
				break;
			case UPDATE_OPERATION:
				await this.update(md5, message);
				break;
			case READ_OPERATION:
				await this.read(md5);
				break;
			case DELETE_OPERATION:
				await this.delete(md5);
				break;
			default:
				console.log("ERROR");
				res.status(404).send("ERROR");
				break;
		}

		res.status(200).send("ok");
	},
};
/**
 * Creates an MD5 hash digest for the given file name.
 *
 * @param {string} fileName - The file name to create the digest for.
 * @return {Promise<string>} A promise that resolves with the MD5 hash digest.
 */
const createDigest = async (fileName: string) => {
	return crypto.createHash("md5").update(fileName).digest("hex");
};
export default dbKernel;
