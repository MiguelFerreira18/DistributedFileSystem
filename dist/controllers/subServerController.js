"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subGroup_1 = require("../src/subGroup");
const dbPardal_json_1 = __importDefault(require("../dbPardal.json"));
const axios_1 = __importDefault(require("axios"));
/**
 * Receives the serverId of another server making the request and his server object, if the id of that server is bigger
 * than the response will send to that server that he is the lader of the group, if it's not bigger,
 * it will send to that server that he is not the leader
 *
 * @param req Received request object that has the server that sent the request and the ID that it has
 * @param res Response to be sent to that server
 */
const receiveId = async (req, res) => {
    try {
        console.log("1");
        const port = dbPardal_json_1.default.PORT;
        console.log("2");
        const { serverId } = req.params;
        console.log("3");
        const { server } = req.body;
        console.log("4");
        // Check if the serverId received is bigger than mine
        if (parseInt(serverId) > dbPardal_json_1.default.serverId) {
            console.log("5");
            // Find my server
            const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(port.toString()));
            //if it has already communicated and is smaller
            if (myServer?.response) {
                console.log("6");
                const sv = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(server));
                if (sv)
                    sv.isOn = true;
                res.status(204).send("this node is smaller and already talked to someone bigger");
                return;
            }
            console.log("7");
            console.log(subGroup_1.mySubServers.length);
            subGroup_1.mySubServers.forEach((element) => {
                console.log("7.1");
                console.log(server);
                console.log(element.serverAdress);
                console.log(element.serverAdress.search(server));
                if (element.serverAdress.search(server) >= 0) {
                    console.log("7.2");
                    element.isLeader = true;
                    element.isOn = true;
                }
                else {
                    console.log("7.3");
                    element.isLeader = false;
                }
                if (element.serverAdress.search(port.toString()) >= 0) {
                    console.log("7.4");
                    element.response = true;
                }
            });
            console.log("8");
            // Send that the other server is the leader by having a bigger id
            res.status(200).send({
                message: "ServerId received",
                myServer: myServer,
                becomeLeader: true,
            });
            console.log("9");
        }
        else {
            console.log("20");
            // Find my server
            const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(port.toString()));
            // if the serverId received is smaller than mine and i have communicated
            if (myServer?.response) {
                res.status(200).send({
                    message: "ServerId received",
                    myServer: myServer,
                    becomeLeader: false,
                });
                return;
            }
            // If the serverId received is smaller than mine, I'm the leader
            subGroup_1.mySubServers.forEach((element) => {
                if (element.serverAdress.search(port.toString()) < 0) {
                    element.isLeader = false;
                    element.isOn = true;
                }
                else
                    element.isLeader = true;
            });
            await switchLeader();
            // Send that the other server is not the leader by having a smaller id
            res.status(200).send({
                message: "ServerId received",
                myServer: myServer,
                becomeLeader: false,
            });
        }
    }
    catch (err) {
        res.status(500).send("Error receiving id");
        //ERROR RECEIVING THE ID OF OTHER SERVER.
    }
};
const sendLeader = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.data);
        const { servers } = req.body;
        console.log(servers);
        console.log("Leader Received");
        for (const server of subGroup_1.mySubServers) {
            if (server.serverAdress.search(servers) >= 0) {
                server.isLeader = true;
                console.log("Leader Updated");
            }
            else {
                server.isLeader = false;
            }
        }
        res.send("ok");
    }
    catch (error) {
        res.send("not ok");
    }
};
const CheckLeaderStatus = async (req, res) => {
    console.log("reached");
    const port = dbPardal_json_1.default.PORT;
    const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(port.toString()));
    res.status(200).send(myServer?.isLeader);
};
async function switchLeader() {
    console.log("send 1");
    const servers = subGroup_1.mySubServers.filter((element) => element.serverAdress.search(dbPardal_json_1.default.PORT.toString()) < 0);
    console.log("send 2");
    console.log(servers.length);
    for (const server of servers) {
        try {
            console.log("send 3");
            const res = await axios_1.default.post(`${server.serverAdress}election/sendLeader`, {
                //Send for the server and then update it
                servers: `http://localhost:${dbPardal_json_1.default.PORT}/`,
            });
            console.log(res.data);
            console.log("send 4");
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = { receiveId, CheckLeaderStatus, receiveLeader: sendLeader };
