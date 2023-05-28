import { logStruct } from "../models/loggerMessageModel";
import { readFileSync } from "fs";

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


export default { receiveLog };
