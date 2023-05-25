import { logger } from "../config/logger";
import { join } from "path";
import conf from "../config/dbPardal.json";
import dbKernel from "../config/module";
import crypto from "crypto";
import { error } from "console";
import { chooseNode, groupNodeReturn } from "../Modules/chooseServer";
import { mySubServers, subServer } from "../src/subGroup";

const folderPath = join(conf.home, conf.dbDir);

const getPage = (req: any, res: any) => {
  res.send("GET request to the homepage");
};

const init = (req: any, res: any) => {
  try {
    console.log("Initializing file system");
    console.log("Group hash: " + req.params.groupHash);
    dbKernel.init(req.params.groupHash, req.body.server).then((isGroup) => {
      if (isGroup) {
        console.log("Group is initialized");
        res.send("Group is initialized");
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
    const getServer = await groupNodeReturn(fileName);
    if (getServer === null) throw error;

    await dbKernel.gossip(fileName, data)//!PENSAR NA LOGICA DISTO DEPOIS;
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
  //Apply message digest to the fileKey

  const fileName = crypto.createHash("md5").update(req.params.fileKey).digest("hex");
  const filePath = join(folderPath, fileName);
  console.log(filePath);
  try {
    const data: string = await dbKernel.read(fileName);
    handleSuccess(1, filePath, data);
    res.send(data);
  } catch (err) {
    console.log(err);
    handleErrors(1, err, filePath);
    res.status(500).send("Error reading file");
  }
};

const writeFile = async (req: any, res: any) => {
  const port = process.env.PORT || 8080;
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  const data: string = JSON.stringify(req.body);

  // Find my server
  const myServer = mySubServers.find((s) =>
    s.serverAdress.includes(port.toString())
  );
  if (myServer?.isLeader)
    await dbKernel.gossip(fileName, data)

  const md5 = crypto.createHash("md5").update(fileName).digest("hex");
  try {
    await dbKernel.create(md5, data);
    handleSuccess(2, filePath, data);
    res.send("File saved successfully");
  } catch (err) {
    console.log(err);
    handleErrors(2, err, filePath);
    res.status(500).send("Error writing file");
  }
};

const updateFile = async (req: any, res: any) => {
  const fileName = crypto.createHash("md5").update(req.params.fileKey).digest("hex");
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
  const fileName = crypto.createHash("md5").update(req.params.fileKey).digest("hex");
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
