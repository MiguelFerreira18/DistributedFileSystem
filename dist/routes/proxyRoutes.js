"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const groups_1 = require("../src/groups");
const module_1 = __importDefault(require("../config/module"));
const chooseServer_1 = require("../Modules/chooseServer");
const router = express_1.default.Router();
//Receive Connection and check if its one of the servers if it is then add the ip sent and change the isActive to True
router.use("/receiveConn/:groupHash", function (req, res) {
    console.log("request Received" + req.body.server);
    let groupHash = req.params.groupHash;
    let group = groups_1.groupMap.get(groupHash);
    if (group !== undefined) {
        group.isActive = true;
        group.server = req.body.server;
        group.proxy = (0, express_http_proxy_1.default)(group.server);
        res.send("ok");
    }
    else {
        res.send("not ok");
    }
});
router.post("/init/:groupHash", async (req, res) => {
    try {
        let groupHash = req.params.groupHash;
        module_1.default.init(groupHash, req.body.server);
    }
    catch (error) {
        res.status(404).send("erro");
    }
});
router.get("/getServers", function (req, res) {
    let serverList = [];
    groups_1.groupMap.forEach((value, key) => {
        if (value.isActive) {
            serverList.push(value.server);
        }
    });
    res.send(serverList);
});
//CRUD
router.get("/file/read/:id", async function (req, res) {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null)
        getServer.proxy(req, res);
    else
        res.status(400).send("No Active Servers");
});
router.post("/file/write/:id", async function (req, res) {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null) {
        console.log("proxy reached");
        console.log("id:", req.params.id, "re_direct => url:", req.url, ", id:", req.params.id, ", path:", req.path, ", params:", req.params);
        getServer.proxy(req, res);
    }
    else
        res.status(400).send("No Active Servers");
});
router.post("/file/update/:id", async function (req, res) {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null)
        getServer.proxy(req, res);
    else
        res.status(400).send("No Active Servers");
});
router.delete("/file/delete/:id", async function (req, res) {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null)
        getServer.proxy(req, res);
    else
        res.status(400).send("No Active Servers");
});
exports.default = router;
