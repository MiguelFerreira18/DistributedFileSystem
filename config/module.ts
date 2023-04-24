import fs from "fs";
import path from "path";
import conf from "../config/dbPardal.json";
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

    //File DB Dir
    dbDir = path.join(home, conf.dbDir);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
      console.log(`Directory ${dbDir} created successfully.`);
    }

    //Routes Dir
    let routesDir = path.join(home, conf.routesDir);
    if (!fs.existsSync(routesDir)) {
      fs.mkdirSync(routesDir);
      console.log(`Directory ${routesDir} created successfully.`);
    }


    //MVC Dir
    let modelsDir = path.join(home, conf.modelsDir);
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir);
      console.log(`Directory ${modelsDir} created successfully.`);
    }
    let controllersDir = path.join(home, conf.controllersDir);
    if (!fs.existsSync(controllersDir)) {
      fs.mkdirSync(controllersDir);
      console.log(`Directory ${controllersDir} created successfully.`);
    }
    let viewsDir = path.join(home, conf.viewsDir);
    if (!fs.existsSync(viewsDir)) {
      fs.mkdirSync(viewsDir);
      console.log(`Directory ${viewsDir} created successfully.`);
    }

  },
  create: function (params: any) {
    
  },
};

export default dbKernel;
