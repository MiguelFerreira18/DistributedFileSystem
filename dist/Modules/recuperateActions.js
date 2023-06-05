"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replicateFromLogs = void 0;
const module_1 = __importDefault(require("../config/module"));
const logs_1 = __importDefault(require("../src/logs"));
const handleErrors_1 = require("../Modules/handleErrors");
const crypto_1 = __importDefault(require("crypto"));
const replicateFromLogs = async () => {
    try {
        const indexes = Array(logs_1.default.length).fill(0); //Cria um array the indexes
        while (true) {
            const timeStamps = [];
            //percorre cada lista
            for (let i = 0; i < logs_1.default.length; i++) {
                const logsInnerList = logs_1.default[i]; //vai buscar o a lista de logs na posição i da lista grande
                const index = indexes[i]; //vais buscar o index que pertence à lista
                console.log(logsInnerList.length);
                console.log(logsInnerList[i]);
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
            //faz a import { logger } from "../config/logger";ação que está escrita na log structure
            if (oldestElement != null) {
                console.log(oldestElement);
                //efetua a ação descrita no log
                const action = oldestElement.timstampStructure.logStructure.Action;
                const structure = oldestElement.timstampStructure.logStructure;
                try {
                    await actions(action, structure);
                }
                catch (err) {
                    console.log(err);
                    //ERROR PERFORMING AN ACTION LOG THE NAME OF THE ACTION
                    (0, handleErrors_1.handleErrors)("actions", err, "../Modules/recuperateActions.ts : 67");
                    continue;
                }
                //incrementa o index daquele log em especifico
                const index = oldestElement.timstampStructure.listIndex;
                indexes[index]++;
            }
            //Se o elemento for nulo, faz se a ação do primeiro e aumenta-se todos os index em 1
            if (oldestElement == null) {
                for (let i = 0; i < indexes.length; i++) {
                    indexes[i]++;
                }
                actions(logs_1.default[0].Action, logs_1.default[0].DataObject);
            }
            //check if all the indexes arrived at their maximum position break the while loop
            const booleanIndexes = Array(logs_1.default.length).fill(false);
            for (let i = 0; i < booleanIndexes.length; i++) {
                if (indexes[i] >= logs_1.default[i].length) {
                    booleanIndexes[i] = true;
                }
            }
            for (const c of booleanIndexes) {
                console.log(c);
            }
            if (booleanIndexes.every(Boolean)) {
                console.log("all?");
                break;
            }
        }
    }
    catch (error) {
        console.log(error);
        //ERROR RETREIVING THE LOGS INNER PROBLEM
        (0, handleErrors_1.handleErrors)("replicateFromLogs", error, "../Modules/recuperateActions.ts : 89");
    }
};
exports.replicateFromLogs = replicateFromLogs;
const actions = async (action, object) => {
    const fileName = object.DataObject.FileName;
    const data = object.DataObject.Data;
    const md5 = await createDigest(fileName);
    switch (action) {
        case "write":
            try {
                await module_1.default.create(md5, data);
                console.log("reached write");
            }
            catch (err) {
                console.log(err);
                //ERROR CREATING INSIDE THE RETRIVE
                (0, handleErrors_1.handleErrors)("write", err, "../Modules/recuperateActions.ts : 102", fileName);
            }
            break;
        case "update":
            try {
                await module_1.default.update(md5, data);
                console.log("reached update");
            }
            catch (err) {
                console.log(err);
                //ERROR UPDATING INSIDE THE RETREIVE
                (0, handleErrors_1.handleErrors)("update", err, "../Modules/recuperateActions.ts : 111", fileName);
            }
            break;
        case "delete":
            try {
                await module_1.default.delete(md5);
                console.log("reached Delete");
            }
            catch (err) {
                console.log(err);
                //ERROR DELETING INSIDE THE RETREIVE
                (0, handleErrors_1.handleErrors)("delete", err, "../Modules/recuperateActions.ts : 120", fileName);
            }
            break;
    }
};
const createDigest = async (fileName) => {
    return crypto_1.default.createHash("md5").update(fileName).digest("hex");
};
