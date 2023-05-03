import fs from "fs";
import path from "path";
import {join} from 'path'
import {promisify} from 'util'
import conf from "../config/dbPardal.json";
import {groupMap,Group} from '../src/groups'

let dbKernel: DbKernel;

let home;
let dbDir;

const folderPath = join(conf.home,conf.dbDir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const appendFileAsync = promisify(fs.appendFile);
const deleteFileAsync = promisify(fs.unlink);

interface DbKernel {
  init:(groupHash:string) => Promise<void>;
  create:(fileName: any, data: any) => Promise<void>;
  update: (fileName: any, data: any) => Promise<void>;
  read: (fileName: any) => Promise<string>;
  delete: (params: any) => Promise<void>;
  groupServerStatus: () => Promise<void>
}

dbKernel = {
  init: async function (groupHash:string) {
    home = conf.home;

    //File DB Dir
    dbDir = path.join(home, conf.dbDir);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
      console.log(`Directory ${dbDir} created successfully.`);
    }
    //check if the groupHash is in the groupMap and if it is check it to is active true
    if(groupMap.has(groupHash)){
      const group:any = groupMap.get(groupHash);
       group.isActive = true;
       console.log("was group")
        console.log(group)
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
  groupServerStatus: async function () {
    //use console.table to make a good table with the groupMap hashTable
    await console.log(groupMap)
    
  }
};

export default dbKernel;
