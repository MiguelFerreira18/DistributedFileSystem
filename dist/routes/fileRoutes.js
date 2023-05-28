"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = __importDefault(require("../controllers/fileController"));
const router = express_1.default.Router();
router.get('/', fileController_1.default.getPage);
router.post('/init/:groupHash', fileController_1.default.init);
router.post('/receive/:fileName', fileController_1.default.receive);
router.get('/status', fileController_1.default.groupServerStatus);
router.get("/read/:fileName", fileController_1.default.readFile);
router.post("/write/:fileName", fileController_1.default.writeFile);
router.post('/update/:fileName', fileController_1.default.updateFile);
router.post('/delete/:fileName', fileController_1.default.deleteFile);
//router.post('/sendFile/:fileName',fileController.sendFile);
exports.default = router;
