import { Request, Response } from "express";
import dbKernel from "../Modules/module";
import { groupNodeReturn } from "../Modules/chooseServer";
import { groupMap, Group } from "../src/groups";
import { handleErrors } from "../Modules/handleErrors";

const init = async (req: Request, res: Response) => {
  try {
    const groupHash = req.params.groupHash;
    await dbKernel.init(groupHash, req.body.server).then((isGroup) => checkIfGroup(isGroup,res) );
  } catch (error) {
    res.status(404).send("Error");
    handleErrors("init", error);//ERROR INITIALIZING
  }
};

const getServers = async (req: Request, res: Response) => {
  const serverList: any[] = [];
  groupMap.forEach((value: Group, key: string) => {
    if (value.isActive) {
      serverList.push(value.server);
    }
  });
  res.send(serverList);
};

const proxyFileRead = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

const proxyFileWrite = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    console.log("Proxy reached");
    console.log(
      "id:",
      req.params.id,
      "re_direct => url:",
      req.url,
      ", id:",
      req.params.id,
      ", path:",
      req.path,
      ", params:",
      req.params
    );
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

const proxyFileUpdate = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

const proxyFileDelete = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

const checkIfGroup = (isGroup:boolean,res:any)=>{
  if (isGroup) {
    console.log("Group is initialized");
    res.send("Group is initialized");
  } else {
    console.log("Group is not initialized");
    res.send("Group is not initialized");
  }
}

export default {
  init,
  getServers,
  proxyFileWrite,
  proxyFileUpdate,
  proxyFileDelete,
  proxyFileRead,
};