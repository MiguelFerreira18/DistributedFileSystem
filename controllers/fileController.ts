import { logger } from "../config/logger";
import { join } from "path";
import conf from "../config/dbPardal.json";
import dbKernel from "../config/module";
import proxy from "express-http-proxy";
import app from "../src/index";
import crypto from "crypto";
import hashGroup, { Group } from "../src/groups";
import { error } from "console";

const folderPath = join(conf.home, conf.dbDir);

const getPage = (req: any, res: any) => {
  res.send("GET request to the homepage");
};

const init = (req: any, res: any) => {
  try {
    console.log("Initializing file system");
    console.log("Group hash: " + req.params.groupHash);
    dbKernel.init(req.params.groupHash).then((isGroup) => {
      if (isGroup) {
        console.log("Group is initialized");

        //!VERIFICAR ESTA PARTE DO CODIGO
        //dynamic proxy servers
        app.use(
          `/api/${req.params.groupHash}`,
          proxy(`http://localhost:${req.body.serverPort}/projName`)
        );
        res.send(
          `Group ${req.params.groupHash} is initialized at http://localhost:${req.body.serverPort} \n\n\n Distributer server route: http://localhost:3002/api/${req.params.groupHash}`
        );
      } else {
        console.log("Group is not initialized");
        res.send("Group is not initialized");
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error initializing file system");
  }
};

const sendFile = async (req: any, res: any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  try {
    
    const data: string = JSON.stringify(req.body);
    const getServer = await activeServers(fileName);
    if(getServer===null) throw error;

    await dbKernel.sendFile(fileName, data,getServer);
    //Mudar estes Handlers
    handleSuccess(2, filePath, data);
    const jsonData = JSON.parse(data);
    res.send(jsonData);
  } catch (err) {
    console.log(err);
    handleErrors(1, err, filePath);
    res.status(500).send("Error reading file");
  }
};

const readFile = async (req: any, res: any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  try {
    const data: string = await dbKernel.read(fileName);
    handleSuccess(1, filePath, data);
    const jsonData = JSON.parse(data);
    res.send(jsonData);
  } catch (err) {
    console.log(err);
    handleErrors(1, err, filePath);
    res.status(500).send("Error reading file");
  }
};

const writeFile = async (req: any, res: any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  const data: string = JSON.stringify(req.body);
  const md5 = crypto.createHash("md5").update(fileName).digest("hex");
  const _8_first_bytes_as_hex = "0x" + md5.substr(0, 16);
  try {
    await dbKernel.create(_8_first_bytes_as_hex, data);
    handleSuccess(2, filePath, data);
    res.send("File saved successfully");
  } catch (err) {
    console.log(err);
    handleErrors(2, err, filePath);
    res.status(500).send("Error writing file");
  }
};

const updateFile = async (req: any, res: any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  const data: string = JSON.stringify(req.body);
  try {
    await dbKernel.update(fileName, data);
    handleSuccess(3, filePath, data);
    res.send("File updated successfully");
  } catch (err) {
    console.log(err);
    handleErrors(3, err, filePath);
    res.status(500).send("Error updating file");
  }
};

const deleteFile = async (req: any, res: any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  try {
    await dbKernel.delete(fileName);
    handleSuccess(4, filePath);
    res.send("File deleted successfully");
  } catch (err) {
    console.log(err);
    handleErrors(4, err, filePath);
    res.status(500).send("Error deleting file");
  }
};
const groupServerStatus = async (req: any, res: any) => {
  try {
    await dbKernel.groupServerStatus();
    res.send("have a good one");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error getting group server status");
  }
};
const handleErrors = async (
  errorLevel: number,
  err: unknown,
  filePath: string
) => {
  switch (errorLevel) {
    case 1:
      logger.error("Error reading file " + err + " from " + filePath);
      break;
    case 2:
      logger.error("Error writing file " + err + " from " + filePath);
      break;
    case 3:
      logger.error("Error updating file " + err + " from " + filePath);
      break;
    case 4:
      logger.error("Error deleting file " + err + " from " + filePath);
      break;
    default:
      logger.error("Error " + err + " from " + filePath);
      break;
  }
};

const handleSuccess = async (
  successLevel: number,
  filePath: string,
  data?: string
) => {
  switch (successLevel) {
    case 1:
      logger.info(
        "File read successfully with data: \n" + data + "\n from " + filePath
      );
      break;
    case 2:
      logger.info(
        "File saved successfully with data: \n" + data + "\n from " + filePath
      );
      break;
    case 3:
      logger.info(
        "File updated successfully with data: \n" + data + "\n from " + filePath
      );
      break;
    case 4:
      logger.info("File deleted successfully from " + filePath);
      break;
    default:
      logger.info("Success from " + filePath);
      break;
  }
};

const chooseNode = async (fileName: string) => {
  let count = 0;
  for (const [key, value] of hashGroup.groupMap) {
    if (value.isActive) {
      count++;
    }
  }
  const Nodes_N = BigInt(count);
  let md5 = crypto.createHash("md5").update(fileName).digest("hex");
  let _8_first_bytes_as_hex = "0x" + md5.substr(0, 16);
  const hugeHex = BigInt(_8_first_bytes_as_hex);
  const destNode = hugeHex % Nodes_N;

  return { destNode, _8_first_bytes_as_hex };
};

const activeServers = async (fileName:string) => {
  const destNode = (await chooseNode(fileName)).destNode
  let group:Group;
  let count = 0;
  for (const [key, value] of hashGroup.groupMap) {
    if(BigInt(count) === destNode){
      group = value
      return group;
    }else if (value.isActive) {
      count++
    }
  }
  return null;
}

export default {
  init,
  sendFile,
  getPage,
  readFile,
  writeFile,
  updateFile,
  deleteFile,
  groupServerStatus,
};
