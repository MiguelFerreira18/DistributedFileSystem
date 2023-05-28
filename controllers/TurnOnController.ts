import { mySubServers, subServer } from "../src/subGroup";
import axios from "axios";
import { logStruct } from "../models/loggerMessageModel";
import logs from "../src/logs";
import { readFileSync } from "fs";
import { replicateFromLogs } from "../Modules/recuperateActions";

const PORT = process.env.PORT || 8080;

const receiveLog = async (req: any, res: any) => {
	//get the latest log from te /logs folder
	const combinedFile = readFileSync("../logs/combined.log", "utf-8");
	let logLineData: logStruct[] = [];
	combinedFile.split(/\r?\n/).forEach((line) => {
		let lineSplit: string[] = [];
		lineSplit = line.split("|");
		if (lineSplit[1] === "info") {
			logLineData.push(JSON.parse(lineSplit[2]));
		}
	});

	res.send(logLineData);
};

//!MUDAR ISTO DE SITIO ISTO É FEITO AO LIGAR
const retreiveLogs = async (req: any, res: any) => {
	mySubServers.forEach(async (element) => {
		try {
			if (element.serverAdress.search(PORT.toString()) < 0) {
				const log = await axios.get(
					`${element.serverAdress}/logs/read`
				);
				logs.push(log.data);
			}
		} catch (err) {
			console.log(err);
			//!METER AQUI O LOGGER
		}
	});
	try {
		await replicateFromLogs();
	} catch (err) {
		console.log(err);
		//!METER AQUI O LOGGER
	}
};

export default { receiveLog };
