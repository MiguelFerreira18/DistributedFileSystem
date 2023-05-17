"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupNodeReturn = exports.chooseNode = void 0;
const groups_1 = require("../src/groups");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Returns the number of the node that will receive the file
 * @param fileName Name of the file that will be sent
 * @returns number of the node
 */
const chooseNode = async (fileName) => {
    let count = 0;
    for (const [key, value] of groups_1.groupMap) {
        if (value.isActive) {
            count++;
        }
    }
    const Nodes_N = BigInt(count);
    let md5 = crypto_1.default.createHash("md5").update(fileName).digest("hex");
    let _8_first_bytes_as_hex = "0x" + md5.substr(0, 16);
    const hugeHex = BigInt(_8_first_bytes_as_hex);
    const destNode = hugeHex % Nodes_N;
    return { destNode, _8_first_bytes_as_hex };
};
exports.chooseNode = chooseNode;
/**
 * Returns the group that will receive the file
 * @param fileName Name of the file that will be sent
 * @returns Group that receives the file
 */
const groupNodeReturn = async (fileName) => {
    const destNode = (await (0, exports.chooseNode)(fileName)).destNode;
    let group;
    let count = 0;
    for (const [key, value] of groups_1.groupMap) {
        if (BigInt(count) === destNode) {
            group = value;
            return group;
        }
        else if (value.isActive) {
            count++;
        }
    }
    return null;
};
exports.groupNodeReturn = groupNodeReturn;
exports.default = { chooseNode: exports.chooseNode, activeServers: exports.groupNodeReturn };
