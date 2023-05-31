import fs, {
	appendFileSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "fs";
import path from "path";
import { join } from "path";
import conf from "../config/dbPardal.json";
import { groupMap, Group } from "../src/groups";
import proxy from "express-http-proxy";
import axios from "axios";
import { mySubServers, subServer } from "../src/subGroup";
import { Console } from "console";
import Message from "../models/FileSchema";

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
		mySubServers.forEach((element) => {
			if (!element.isLeader) {
				const url = `http://${element.serverAdress}/receive/${fileName}`;
				axios.post(url, {
					body,
					functionality,
				});
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
		const FUNCTIONALITY = req.data.functionality;
		const fileName = req.params.fileName;
		const message:Message = {
			fileName,
			messageBody: req.data.body
		};

		switch (FUNCTIONALITY) {
			case WRITE_OPERATION:
				await this.create(fileName, message);
				break;
			case UPDATE_OPERATION:
				await this.update(fileName, message);
				break;
			case READ_OPERATION:
				await this.read(fileName);
				break;
			case DELETE_OPERATION:
				await this.delete(fileName);
				break;
			default:
				console.log("ERROR");
				res.status(404).send("ERROR");
				break;
		}

		res.status(200).send("ok");
	},
};

export default dbKernel;
