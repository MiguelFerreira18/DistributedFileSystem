"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replicateFromLogs = void 0;
const module_1 = __importDefault(require("../config/module"));
const logs_1 = __importDefault(require("../src/logs"));
const PORT = process.env.PORT || 8080;
const replicateFromLogs = async () => {
    try {
        const indexes = Array(logs_1.default.length).fill(0); //Cria um array the indexes
        while (true) {
            const timeStamps = [];
            //percorre cada lista
            for (let i = 0; i < logs_1.default.length; i++) {
                const logsInnerList = logs_1.default[i]; //vai buscar o a lista de logs na posição i da lista grande
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
            let oldestElement = null;
            //compara as timestamps na lista e o que tiver a data mais antiga faz a ação e incrementa na sua pozição o index em 1
            for (let i = 0; i < timeStamps.length; i++) {
                const currentElement = timeStamps[i];
                //Verifica qual dos elementos tem a data mais antiga
                if (oldestElement == null ||
                    currentElement.logStructure.TimeStamp <
                        oldestElement.timeStamp) {
                    oldestElement = {
                        timeStamp: currentElement.logStructure.TimeStamp,
                        timstampStructure: currentElement,
                    };
                }
            }
            //faz a ação que está escrita na log structure
            if (oldestElement != null) {
                //efetua a ação descrita no log
                const action = oldestElement.timstampStructure.logStructure.Action;
                const structure = oldestElement.timstampStructure.logStructure;
                try {
                    await actions(action, structure);
                }
                catch (err) {
                    console.log(err);
                    continue;
                }
                //incrementa o index daquele log em especifico
                const index = oldestElement.timstampStructure.listIndex;
                indexes[index]++;
            }
            //check if all the indexes arrived at their maximum position break the while loop
            const booleanIndexes = Array(logs_1.default.length).fill(false);
            for (let i = 0; i < booleanIndexes.length; i++) {
                if (indexes[i] >= logs_1.default.length) {
                    booleanIndexes[i] = true;
                }
            }
            if (booleanIndexes.every(Boolean)) {
                break;
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    console.log("end");
};
exports.replicateFromLogs = replicateFromLogs;
const actions = async (action, object) => {
    const fileName = object.DataObject.fileName;
    const data = object.DataObject.Data;
    switch (action) {
        case "write":
            try {
                await module_1.default.create(fileName, data);
            }
            catch (err) {
                console.log(err);
            }
            break;
        case "update":
            try {
                await module_1.default.update(fileName, data);
            }
            catch (err) {
                console.log(err);
            }
            break;
        case "delete":
            try {
                await module_1.default.delete(fileName);
            }
            catch (err) {
                console.log(err);
            }
            break;
    }
};
