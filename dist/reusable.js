"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiply = exports.add = exports.init = void 0;
let m0 = {};
function init(conf) {
    home = conf.home;
}
exports.init = init;
function add(a, b = 0) {
    return a + b;
}
exports.add = add;
function multiply(a, b = 1) {
    return a * b;
}
exports.multiply = multiply;
let home;
m0 = { init, add, multiply };
exports.default = m0;
