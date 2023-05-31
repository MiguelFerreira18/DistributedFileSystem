"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = __importDefault(require("../config/module"));
const chooseServer_1 = require("../Modules/chooseServer");
const groups_1 = require("../src/groups");
const handleErrors_1 = require("../Modules/handleErrors");
const init = async (req, res) => {
    try {
        const groupHash = req.params.groupHash;
        await module_1.default.init(groupHash, req.body.server);
    }
    catch (error) {
        res.status(404).send("Error");
        //ERROR INITIALIZING
        (0, handleErrors_1.handleErrors)("init", error);
    }
};
const getServers = async (req, res) => {
    const serverList = [];
    groups_1.groupMap.forEach((value, key) => {
        if (value.isActive) {
            serverList.push(value.server);
        }
    });
    res.send(serverList);
};
const proxyFileRead = async (req, res) => {
    const getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null) {
        getServer.proxy(req, res);
    }
    else {
        res.status(400).send("No Active Servers");
    }
};
const proxyFileWrite = async (req, res) => {
    const getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null) {
        console.log("Proxy reached");
        console.log("id:", req.params.id, "re_direct => url:", req.url, ", id:", req.params.id, ", path:", req.path, ", params:", req.params);
        getServer.proxy(req, res);
    }
    else {
        res.status(400).send("No Active Servers");
    }
};
const proxyFileUpdate = async (req, res) => {
    const getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null) {
        getServer.proxy(req, res);
    }
    else {
        res.status(400).send("No Active Servers");
    }
};
const proxyFileDelete = async (req, res) => {
    const getServer = await (0, chooseServer_1.groupNodeReturn)(req.params.id);
    if (getServer !== null) {
        getServer.proxy(req, res);
    }
    else {
        res.status(400).send("No Active Servers");
    }
};
exports.default = {
    init,
    getServers,
    proxyFileWrite,
    proxyFileUpdate,
    proxyFileDelete,
    proxyFileRead,
};
