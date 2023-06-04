"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const logger_1 = require("../config/logger");
const fileRoutes_1 = __importDefault(require("../routes/fileRoutes"));
const subGroup_1 = require("../src/subGroup");
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const proxyRoutes_1 = __importDefault(require("../routes/proxyRoutes"));
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const subServerRoutes_1 = __importDefault(require("../routes/subServerRoutes"));
const logs_1 = __importDefault(require("../src/logs"));
const TurnOnRoutes_1 = __importDefault(require("../routes/TurnOnRoutes"));
const handleErrors_1 = require("../Modules/handleErrors");
const config_1 = __importDefault(require("../models/config"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const PORT = config_1.default.PORT;
let hasCommunicated = false;
let subServerOn = [];
app.get("/", (req, res) => {
    res.send("FileSystem");
});
//Routes for files manipulation
if (!dbPardal_json_1.default.isProxy) {
    app.use("/file", fileRoutes_1.default);
    app.use("/election", subServerRoutes_1.default);
    app.use("/logs", TurnOnRoutes_1.default);
    app.get("/check", async (req, res) => {
        try {
            console.log("reached");
            const port = config_1.default.PORT;
            const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(port.toString()));
            res.status(200).send(myServer?.isLeader);
        }
        catch (err) {
            console.log("error");
        }
    });
    //Call the gossip protocol
}
else {
    app.use("/api", proxyRoutes_1.default);
}
//see if server is reachable
async function reach() {
    try {
        if (dbPardal_json_1.default.isProxy) {
            await axios_1.default.get("http://localhost:3501");
        }
        else {
            await axios_1.default.get("http://localhost:3000");
            console.log("proxy is reachable");
        }
    }
    catch (err) {
        console.log("Server is not reachable");
        //POBLEM WHILE SEEING IF ITS REACHABLE IGNORE
        (0, handleErrors_1.handleErrors)("reach", err, "../src/index.ts : 52");
    }
}
async function callSubServer(element) {
    try {
        await axios_1.default.get(element.serverAdress);
        console.log("Server " + element.serverAdress + " is reachable");
        hasCommunicated = true;
        subServerOn.push(element);
    }
    catch (err) {
        console.log("Server " + element.serverAdress + " is not reachable");
        //ERROR CALLING SUB SERVERS
        (0, handleErrors_1.handleErrors)("callSubServer", err, "../src/index.ts : 65");
    }
}
async function communicateWithSubServers() {
    if (!dbPardal_json_1.default.isProxy) {
        const promises = subGroup_1.mySubServers
            .filter((element) => element.serverAdress.search(PORT.toString()) < 0)
            .map(callSubServer);
        await Promise.all(promises);
    }
}
async function electLeader() {
    console.log(subServerOn);
    if (!hasCommunicated && !dbPardal_json_1.default.isProxy) {
        try {
            await axios_1.default.post("http://localhost:3000/api/init/1b02d8d2476", {
                server: `http://localhost:${PORT}/`,
            });
            console.log("Server " + PORT + " is the leader");
        }
        catch (err) {
            console.log("Server " + PORT + " is not the leader");
            //PROBLEM ANNOUNCING THE LEADER
            (0, handleErrors_1.handleErrors)("electLeader", err, "../src/index.ts : 89");
        }
    }
    else if (hasCommunicated && !dbPardal_json_1.default.isProxy) {
        const promises = subServerOn.map(async (element) => {
            try {
                console.log(`${element.serverAdress}election/${dbPardal_json_1.default.serverId}`);
                const res = await axios_1.default.post(`${element.serverAdress}election/${dbPardal_json_1.default.serverId}`, {
                    server: element.serverAdress,
                });
                if (res.status == 204) {
                    console.log("Server " +
                        PORT +
                        " is not the leader because the other has already talked");
                    return;
                }
                else if (res.data.becomeLeader && res.status == 200) {
                    try {
                        // Find my server
                        const server = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(PORT.toString()));
                        if (server != null) {
                            server.isLeader = true;
                        }
                        await axios_1.default.post("http://localhost:3000/api/init/1b02d8d2476", {
                            server: `http://localhost:${PORT}/`,
                        });
                        console.log("Server " + PORT + " is the leader");
                    }
                    catch (err) {
                        console.log("Server " + PORT + " is not the leader");
                        //PROBLEM ANNOUCING THE LEADER
                        (0, handleErrors_1.handleErrors)("electLeader", err, "../src/index.ts : 117");
                    }
                }
                else if (!res.data.becomeLeader && res.status == 200) {
                    console.log("Server " + PORT + " is not the leader");
                    subGroup_1.mySubServers.forEach((server) => {
                        if (server.serverAdress.search(PORT.toString()) >= 0) {
                            server.response = true;
                        }
                    });
                }
                // Find my server
                const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(PORT.toString()));
                /*
                This is the server that has the smaller id and because of that it has received a comm so when talking to
                other servers it wont make any deviations
                */
                if (myServer != null) {
                    myServer.response = true;
                }
            }
            catch (err) {
                console.log("Server " + PORT + " is not the leader");
                //PROBLEM ANNOUNCING THE LEADER
                (0, handleErrors_1.handleErrors)("electLeader", err, "../src/index.ts : 140");
            }
        });
        await Promise.all(promises);
    }
}
async function retreiveLogs() {
    for (const element of subServerOn) {
        try {
            if (element.serverAdress.search(PORT.toString()) < 0) {
                const log = await axios_1.default.get(`${element.serverAdress}logs/read`);
                logs_1.default.push(log.data);
                console.log(log.data);
            }
        }
        catch (err) {
            console.log(err);
            //ERROR RETRIEVING LOGS
            (0, handleErrors_1.handleErrors)("retreiveLogsAxios", err, "../src/index.ts : 158");
        }
    }
    console.log("end of of for each");
    try {
        //await replicateFromLogs();
    }
    catch (err) {
        console.log(err);
        //ERROR RETRIEVING LOGS CHECK INSIDE
        (0, handleErrors_1.handleErrors)("retreiveLogsfunction", err, "../src/index.ts : 166");
    }
    console.log("end of method");
}
async function initializeServer() {
    if (dbPardal_json_1.default.isProxy) {
        await reach();
        return;
    }
    await reach();
    console.log("log1");
    await communicateWithSubServers();
    console.log("log2");
    //await electLeader(); //!TROCAR ISTO DEPOIS, TIRAR O COMENTÁRIO
    console.log("log3");
    //await retreiveLogs();
    console.log("log4");
}
app.listen(PORT, async () => {
    dbPardal_json_1.default.serverId = (0, lodash_1.toInteger)(Math.random() * 10001);
    console.log(dbPardal_json_1.default.serverId);
    console.log(`my server Id is  ${dbPardal_json_1.default.serverId}`);
    logger_1.logger.warn("-------------------------------------------Server started---------------------------------------------");
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    await initializeServer();
});
exports.default = app;
