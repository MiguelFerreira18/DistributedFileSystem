"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subServerController_1 = __importDefault(require("../controllers/subServerController"));
const router = express_1.default.Router();
router.use('/:serverId', subServerController_1.default.receiveId);
router.use('/CheckLeaderStatus', subServerController_1.default.CheckLeaderStatus);
exports.default = router;
