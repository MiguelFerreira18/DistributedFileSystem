import dbKernel from "../config/module";
import { logger } from "../config/logger";
import logs from "../src/logs";
import { logStruct } from "../models/loggerMessageModel";

const PORT = process.env.PORT || 8080;

type timestamps = {
	logStructure: logStruct;
	listIndex: number;
};

type elem = {
	timeStamp: string;
	timstampStructure: timestamps;
} | null;

const replicateFromLogs = async () => {
	const indexes: number[] = Array(logs.length).fill(0); //Cria um array the indexes
	while (true) {
		const timeStamps: timestamps[] = [];

		//percorre cada lista
		for (let i = 0; i < logs.length; i++) {
			const logsInnerList: logStruct[] = logs[i]; //vai buscar o a lista de logs na posição i da lista grande
			const index = indexes[i]; //vais buscar o index que pertence à lista

			if (index < logsInnerList.length) {
				//acede ao elemento
				const element = logsInnerList[index];
				//adiciona o timestamp na lista para depois se comparar
				timeStamps.push({
					logStructure: element,
					listIndex: i,
				});
			}
		}
		let oldestElement: elem = null;
		//compara as timestamps na lista e o que tiver a data mais antiga faz a ação e incrementa na sua pozição o index em 1
		for (let i = 0; i < timeStamps.length; i++) {
			const currentElement = timeStamps[i];

			//Verifica qual dos elementos tem a data mais antiga
			if (
				oldestElement == null ||
				currentElement.logStructure.TimeStamp < oldestElement.timeStamp
			) {
				oldestElement = {
					timeStamp: currentElement.logStructure.TimeStamp,
					timstampStructure: currentElement,
				};
			}
		}
		//faz a ação que está escrita na log structure
		if (oldestElement != null) {
			//efetua a ação descrita no log
			const action: string =
				oldestElement.timstampStructure.logStructure.Action;
			const structure: logStruct =
				oldestElement.timstampStructure.logStructure;
			try {
				await actions(action, structure);
			} catch (err) {
				console.log(err);
				continue;
			}
			//incrementa o index daquele log em especifico
			const index = oldestElement.timstampStructure.listIndex;
			indexes[index]++;
		}
	}
};
const actions = async (action: string, object: logStruct) => {
	switch (action) {
		case "write":
			//TODO
			break;
		case "update":
			//TODO
			break;
		case "delete":
			//TODO
			break;

		default:
			//TODO
			break;
	}
};

export { replicateFromLogs };
