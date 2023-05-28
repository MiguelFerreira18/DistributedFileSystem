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
	try {
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
					currentElement.logStructure.TimeStamp <
						oldestElement.timeStamp
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
					//ERROR PERFORMING AN ACTION LOG THE NAME OF THE ACTION
					continue;
				}
				//incrementa o index daquele log em especifico
				const index = oldestElement.timstampStructure.listIndex;
				indexes[index]++;
			}
			//check if all the indexes arrived at their maximum position break the while loop
			const booleanIndexes: boolean[] = Array(logs.length).fill(false);
			for (let i = 0; i < booleanIndexes.length; i++) {
				if (indexes[i] >= logs.length) {
					booleanIndexes[i] = true;
				}
			}
			if (booleanIndexes.every(Boolean)) {
				break;
			}
		}
	} catch (error) {
		console.log(error)
		//ERROR RETREIVING THE LOGS INNER PROBLEM
	}
};
const actions = async (action: string, object: logStruct) => {
	const fileName = object.DataObject.fileName;
	const data = object.DataObject.Data;
	switch (action) {
		case "write":
			try {
				await dbKernel.create(fileName, data);
			} catch (err) {
				console.log(err);
				//ERROR CREATING INSIDE THE RETRIVE
			}
			break;
		case "update":
			try {
				await dbKernel.update(fileName, data);
			} catch (err) {
				console.log(err);
				//ERROR UPDATING INSIDE THE RETREIVE
			}
			break;
		case "delete":
			try {
				await dbKernel.delete(fileName);
			} catch (err) {
				console.log(err);
				//ERROR DELETING INSIDE THE RETREIVE
			}
			break;
	}
};

export { replicateFromLogs };
