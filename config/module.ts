import fs from "fs";
import path from "path";
import {join} from 'path'
import {promisify} from 'util'
import conf from "../config/dbPardal.json";
let dbKernel: DbKernel;

let home;
let dbDir;

const folderPath = join(conf.home,conf.dbDir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const appendFileAsync = promisify(fs.appendFile);
const deleteFileAsync = promisify(fs.unlink);

interface DbKernel {
  init:() => void;
  create:(fileName: any, data: any) => Promise<void>;
  update: (fileName: any, data: any) => Promise<void>;
  read: (fileName: any) => Promise<string>;
  delete: (params: any) => Promise<void>;
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
  create: async function (fileName: any, data: any) {
    const filePath = join(folderPath, fileName);
    await appendFileAsync(filePath, data, "utf-8");

  },
  update:async function (fileName: any, data: any) {

    const filePath = join(folderPath, fileName);
    await writeFileAsync(filePath, JSON.stringify(data) , "utf-8");
  },
  read: async function (fileName: any) {

    const filePath = join(folderPath, fileName);
    const data:string = await readFileAsync(filePath, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData;
  },
  delete: async function (fileName: any) {
      
      const filePath = join(folderPath, fileName);
      await deleteFileAsync(filePath);
  },
};

export default dbKernel;
