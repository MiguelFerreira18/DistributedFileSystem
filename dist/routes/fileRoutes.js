"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = __importDefault(require("../controllers/fileController"));
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const router = express_1.default.Router();
router.get('/', fileController_1.default.getPage);
router.post('/init/:groupHash', fileController_1.default.init);
router.post('/sendFile/:fileKey', fileController_1.default.sendFile);
router.get("/read/:fileKey", fileController_1.default.readFile);
router.post("/write/:fileKey", fileController_1.default.writeFile);
router.post('/update/:fileKey', fileController_1.default.updateFile);
router.post('/delete/:fileKey', fileController_1.default.deleteFile);
router.get('/status', fileController_1.default.groupServerStatus);
exports.default = dbPardal_json_1.default.isProxy ? null : router;
