import fs from "fs";
import path from "path";
import { inherits } from "util";
import conf from "./dbPardal.json";
let dbKernel: DbKernel;

let home;
let dbDir;

interface DbKernel {
  init: () => void;
  create: (params: any) => void;
}

dbKernel = {
  init: function () {
    
    home = conf.home;
    dbDir = path.join(home, conf.dbDir);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
      console.log(`Directory ${dbDir} created successfully.`);
    }
    let routesDir = path.join(home, conf.routesDir);
    if (!fs.existsSync(routesDir)) {
      fs.mkdirSync(routesDir);
      console.log(`Directory ${routesDir} created successfully.`);
    }
  },
  create: function (params: any) {
    
  },
};

export default dbKernel;
