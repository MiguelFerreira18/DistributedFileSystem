"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const module_1 = __importDefault(require("../config/module"));
const chooseServer_1 = require("../Modules/chooseServer");
const groups_1 = require("../src/groups");
const folderPath = (0, path_1.join)(dbPardal_json_1.default.home, dbPardal_json_1.default.dbDir);
const init = async (req, res) => {
    try {
        let groupHash = req.params.groupHash;
        module_1.default.init(groupHash, req.body.server);
    }
    catch (error) {
        res.status(404).send("erro");
    }
};
const getServers = async (req, res) => {
    let serverList = [];
    groups_1.groupMap.forEach((value, key) => {
        if (value.isActive) {
            serverList.push(value.server);
        }
    });
    res.send(serverList);
};
const proxyFileRead = async (req, res) => {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null)
        getServer.proxy(req, res);
    else
        res.status(400).send("No Active Servers");
};
const proxyFileWrite = async (req, res) => {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null) {
        console.log("proxy reached");
        console.log("id:", req.params.id, "re_direct => url:", req.url, ", id:", req.params.id, ", path:", req.path, ", params:", req.params);
        getServer.proxy(req, res);
    }
    else
        res.status(400).send("No Active Servers");
};
const proxyFileUpdate = async (req, res) => {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null)
        getServer.proxy(req, res);
    else
        res.status(400).send("No Active Servers");
};
const proxyFileDelete = async (req, res) => {
    let getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null)
        getServer.proxy(req, res);
    else
        res.status(400).send("No Active Servers");
};
exports.default = {
    init,
    getServers,
    proxyFileWrite,
    proxyFileUpdate,
    proxyFileDelete,
    proxyFileRead
};
