import fs from "fs";
import path from "path";
import _ from "lodash";

let m0 = {}

interface Config {
  home: string;
}

function init(conf: Config): void {
  home = conf.home;
}

function add(a: number, b: number = 0): number {
  return a + b;
}

function multiply(a: number, b: number = 1): number {
  return a * b;
}

let home: string;
m0 ={init,add,multiply}
export { init, add, multiply };
export default m0;

