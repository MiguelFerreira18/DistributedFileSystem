import { logStruct } from "../models/loggerMessageModel";
import db from "../dbPardal.json";
import { readFileSync } from "fs";
import path from "path";

/**
 * Reads the latest log file from the /logs folder and returns an array of logStruct objects
 * representing the info logs.
 *
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @return {Promise<void>} - returns a Promise that resolves to void
 */
const readLog = async (req: any, res: any) => {
	//get the latest log from te /logs folder
	console.log("Into logs");
	const logsFilePath = path.join(db.home, "logs", "combined.log");
	const combinedFile = readFileSync(logsFilePath, "utf-8");
	let logLineData: logStruct[] = [];
	combinedFile.split(/\r?\n/).forEach((line) => {
		if (line === "") return;
		line.trim();
		let lineSplit: string[] = [];
		lineSplit = line.split("|");
		console.log("MY SPLIT>>>> " + lineSplit.length + "\n");
		if (lineSplit[1].includes("info")) {
			logLineData.push(JSON.parse(lineSplit[2]));
			console.log(lineSplit[2]);
		}
	});
	console.log("end of logs");
	res.send(logLineData);
};

export default { readLog };
