import fs from "fs";
import path from "path";
import a from "./dbPardal.json";
import { inherits } from "util";

let dbKernel: DbKernel;
//let conf = {};
let home;
let dbDir;

interface DbKernel {
  init: (conf: any) => void;
  create: (params: any) => void;
}

dbKernel = {
  init: function (conf: any) {
    home = conf.home;
    dbDir = path.join(home, conf.dbDir);
  },
  create: function (params: any) {
    // implementation for create method
  },
};

export default dbKernel;
