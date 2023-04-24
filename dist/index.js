"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const module_1 = __importDefault(require("./module"));
const body_parser_1 = __importDefault(require("body-parser"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
module_1.default.init();
console.log(module_1.default);
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const port = process.env.PORT;
//Routes for files manipulation
app.use(fileRoutes_1.default);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
