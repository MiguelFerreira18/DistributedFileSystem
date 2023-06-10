"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = __importDefault(require("../Modules/module"));
const crypto_1 = __importDefault(require("crypto"));
const subGroup_1 = require("../src/subGroup");
const dbPardal_json_1 = __importDefault(require("../dbPardal.json"));
const turnOfNode = async (req, res) => {
    dbPardal_json_1.default.isOn = false;
};
const identifyFile = async (req, res) => {
    const { fileName } = req.body;
    const md5 = await createDigest(fileName);
    const file = await module_1.default.read(md5);
    if (file) {
        res.send({
            server: `http://localhost:${dbPardal_json_1.default.PORT}`,
            hasFile: true
        });
    }
};
const getStructure = async (req, res) => {
    /*
     {
        proxy:
        {
            ip:ip da minha proxy,
            port: porta da minha proxy
        }
        nodes: ['abc':
            {
                hosts:
                    [
                        {ip:'127.0.0.1',port:3000},
                        {ip:'127.0.0.1',port:3001},
                        {ip:'127.0.0.1',port:3002}
                    ]
                    master: 2
    }
    */
    let i = 0;
    for (const server of subGroup_1.mySubServers) {
        if (server.isLeader)
            return;
        i++;
    }
    const cena = {
        proxy: {
            ip: '127.0.0.1',
            port: 3000
        },
        nodes: [
            {
                '1b02d8d2476': {
                    hosts: [
                        { ip: '127.0.0.1', port: 3500 },
                        { ip: '127.0.0.1', port: 3501 },
                        { ip: '127.0.0.1', port: 3502 }
                    ],
                    master: i
                }
            }
        ]
    };
};
const createDigest = async (fileName) => {
    return crypto_1.default.createHash("md5").update(fileName).digest("hex");
};
exports.default = { turnOfNode, identifyFile, getStructure };
