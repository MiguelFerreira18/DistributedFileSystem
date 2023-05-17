"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const logger_1 = require("../config/logger");
const fileRoutes_1 = __importDefault(require("../routes/fileRoutes"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const groups_1 = require("../src/groups");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const port = process.env.PORT || 8080;
let servers = [];
app.get("/", (req, res) => {
    res.send("FileSystem");
});
//Anuncia a chamada TESTING REMOVE LATER
app.post("/initConn", function (req, res) {
    (0, axios_1.default)({
        method: "post",
        url: "http://localhost:3002/api/init/1b02d8d2476",
        data: {
            server: `http://${dbPardal_json_1.default.controllerIdPort}:3001`,
        },
    })
        .then((response) => {
        console.log(response.data);
        res.send(response.data);
    })
        .catch((error) => {
        console.log(error);
    });
});
//Routes for files manipulation
if (fileRoutes_1.default !== null) {
    app.use("/file", fileRoutes_1.default);
}
//Route to receive a server
app.post("/receiveServer", function (req, res) {
    const server = (0, lodash_1.map)(req.body, (server) => {
        return {
            id: server.id,
            host: server.host,
            port: server.port,
            usage: server.usage,
        };
    });
    servers.push(server);
});
//remove server from servers array
app.post("/removeServer", function (req, res) {
    const server = (0, lodash_1.map)(req.body, (server) => {
        return {
            id: server.id,
            host: server.host,
            port: server.port,
            usage: server.usage,
        };
    });
    servers = servers.filter((server) => server.id !== server.id);
});
//get the servers connected
app.get("/getServers", function (req, res) {
    //Make a table with console.table
    console.table(servers);
    res.send(servers);
});
//make a reverse proxy with the package that already has the groupServers in a map
app.use("/file", (0, express_http_proxy_1.default)("http://localhost:3001", {
    proxyReqPathResolver: function (req) {
        const url = req.url.split("/");
        const id = url[2];
        const server = groups_1.groupMap.get(id);
        if (server) {
            return `/file/${server.server}${req.url}`;
        }
        return `/file/${req.url}`;
    },
}));
//start the server
app.listen(port, () => {
    logger_1.logger.info("-------------------------------------------Server started---------------------------------------------");
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
exports.default = app;
