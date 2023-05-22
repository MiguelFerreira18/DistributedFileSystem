"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mySubServers = void 0;
let mySubServers = [];
exports.mySubServers = mySubServers;
mySubServers.push({
    serverAdress: "http://localhost:3501/",
    response: false,
    isLeader: false
});
mySubServers.push({
    serverAdress: "http://localhost:3502/",
    response: false,
    isLeader: false
});
