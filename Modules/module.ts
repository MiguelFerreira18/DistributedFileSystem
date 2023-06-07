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
	create: async function (fileName: any, messageBody: Message) {
		const filePath = join(folderPath, fileName + ".json");
	
		await appendFileSync(filePath, JSON.stringify(messageBody), "utf-8");
	},
	update: async function (fileName: any, messageBody: Message) {
		const filePath = join(folderPath, fileName + ".json");


		await writeFileSync(filePath, JSON.stringify(messageBody), "utf-8");
	},
	read: async function (fileName: any) {
		const filePath = join(folderPath, fileName + ".json");
		const data: string = await readFileSync(filePath, "utf-8");
		const jsonData:Message = JSON.parse(data);
		return jsonData.messageBody;
	},
	delete: async function (fileName: any) {
		const filePath = join(folderPath, fileName + ".json");
		await unlinkSync(filePath);
	},
	groupServerStatus: async function () {
		await console.log(groupMap);
	},
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
const createDigest = async (fileName: string) => {
	return crypto.createHash("md5").update(fileName).digest("hex");
};
export default dbKernel;
