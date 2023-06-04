"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const proxyController_1 = __importDefault(require("../controllers/proxyController"));
const router = express_1.default.Router();
//Initialize the Leader of the group on the proxy
router.post("/init/:groupHash", proxyController_1.default.init);
router.get("/getServers", proxyController_1.default.getServers);
//CRUD
router.get("/file/read/:id", proxyController_1.default.proxyFileRead);
router.post("/file/write/:id", proxyController_1.default.proxyFileWrite);
router.post("/file/update/:id", proxyController_1.default.proxyFileUpdate);
router.post("/file/delete/:id", proxyController_1.default.proxyFileDelete);
exports.default = router;
