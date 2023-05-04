"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const logger_1 = require("../config/logger");
const fileRoutes_1 = __importDefault(require("../routes/fileRoutes"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use('/newApi/*', (0, express_http_proxy_1.default)("http://localhost:3001/"));
app.use(body_parser_1.default.json());
const port = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.send("FileSystem");
});
//Routes for files manipulation
app.use('/file', fileRoutes_1.default);
app.listen(port, () => {
    logger_1.logger.info("-------------------------------------------Server started---------------------------------------------");
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
exports.default = app;
