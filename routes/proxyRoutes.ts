import express from "express";
import { Request, Response } from "express";
import { groupMap, Group } from "../src/groups";
import dbKernel from "../config/module";
import { chooseNode, groupNodeReturn } from "../Modules/chooseServer";

const router = express.Router();

//Initialize the Leader of the group on the proxy
router.post("/init/:groupHash", async (req: Request, res: Response) => {
  try {
    let groupHash = req.params.groupHash;
    dbKernel.init(groupHash, req.body.server);
  } catch (error) {
    res.status(404).send("erro");
  }
});

router.get("/getServers", function (req, res) {
  let serverList: any[] = [];
  groupMap.forEach((value: Group, key: string) => {
    if (value.isActive) {
      serverList.push(value.server);
    }
  });
  res.send(serverList);
});

//CRUD
router.get("/file/read/:id", async function (req, res) {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) getServer.proxy(req, res);
  else res.status(400).send("No Active Servers");
});

router.post("/file/write/:id", async function (req, res) {
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
});

router.post("/file/update/:id", async function (req, res) {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) getServer.proxy(req, res);
  else res.status(400).send("No Active Servers");
});

router.delete("/file/delete/:id", async function (req, res) {
  let getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) getServer.proxy(req, res);
  else res.status(400).send("No Active Servers");
});

export default router;
