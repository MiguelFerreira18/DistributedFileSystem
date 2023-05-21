import { logger } from "../config/logger";
import { Request, Response } from "express";
import { join } from "path";
import conf from "../config/dbPardal.json";
import dbKernel from "../config/module";

import { chooseNode, groupNodeReturn } from "../Modules/chooseServer";
import { groupMap, Group } from "../src/groups";

const folderPath = join(conf.home, conf.dbDir);

const init = async (req: Request, res: Response) => {
  try {
    let groupHash = req.params.groupHash;
    dbKernel.init(groupHash, req.body.server);
  } catch (error) {
    res.status(404).send("erro");
  }
};
const getServers = async (req: Request, res: Response) => {
  let serverList: any[] = [];
  groupMap.forEach((value: Group, key: string) => {
    if (value.isActive) {
      serverList.push(value.server);
    }
  });
  res.send(serverList);
};

const proxyFileRead = async (req: Request, res: Response) => {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) getServer.proxy(req, res);
  else res.status(400).send("No Active Servers");
};

const proxyFileWrite = async (req: Request, res: Response) => {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    console.log("proxy reached");
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
  } else res.status(400).send("No Active Servers");
};
const proxyFileUpdate = async (req: Request, res: Response) => {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) getServer.proxy(req, res);
  else res.status(400).send("No Active Servers");
};

const proxyFileDelete = async (req: Request, res: Response) => {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) getServer.proxy(req, res);
  else res.status(400).send("No Active Servers");
};

export default {
  init,
  getServers,
  proxyFileWrite,
  proxyFileUpdate,
  proxyFileDelete,
  proxyFileRead
};
