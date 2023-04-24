"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: 'logs/combined.log' })
    ]
});
exports.logger = logger;
