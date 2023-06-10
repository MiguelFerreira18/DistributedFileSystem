import { Request, Response } from "express";
import dbKernel from "../Modules/module";
import { groupNodeReturn } from "../Modules/chooseServer";
import { groupMap, Group } from "../src/groups";
import { handleErrors } from "../Modules/handleErrors";

/**
 * Initializes the database kernel for a given group hash and server. 
 *
 * @param {Request} req - the request object containing parameters and body
 * @param {Response} res - the response object to be sent
 * @return {Promise<void>} A Promise that resolves when initialization is complete or rejects with an error 
 */
const init = async (req: Request, res: Response) => {
  try {
    const groupHash = req.params.groupHash;
    await dbKernel.init(groupHash, req.body.server).then((isGroup) => checkIfGroup(isGroup,res) );
  } catch (error) {
    res.status(404).send("Error");
    handleErrors("init", error);//ERROR INITIALIZING
  }
};

/**
 * Returns an array of active servers based on the values stored in groupMap.
 *
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 * @return {Promise<void>} - a promise that resolves with the server list array
 */
const getServers = async (req: Request, res: Response) => {
  const serverList: any[] = [];
  groupMap.forEach((value: Group, key: string) => {
    if (value.isActive) {
      serverList.push(value.server);
    }
  });
  res.send(serverList);
};

/**
 * Asynchronous function that reads a file through a proxy server. 
 * It retrieves a server based on a given ID, and, if available, 
 * proxies the request and response objects. Otherwise, it returns 
 * a 400 error.
 *
 * @param {Request} req - request object with information about 
 * the incoming HTTP request
 * @param {Response} res - response object with information about 
 * the outgoing HTTP response
 * @return {Promise<void>} a promise that resolves when the function 
 * has completed its execution
 */
const proxyFileRead = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

/**
 * Asynchronously writes a file by proxying the request to the server with the
 * given ID. If the server is active, the request is proxied and the server's
 * response is returned. Otherwise, a 400 status and "No Active Servers" message
 * are returned.
 *
 * @param {Request} req - The incoming HTTP request object.
 * @param {Response} res - The HTTP response object to send back.
 * @return {Promise<void>} A Promise that resolves when the file is written or
 * the server is inactive.
 */
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

/**
 * Executes a proxy update on a server with the given ID.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} Returns nothing.
 */
const proxyFileUpdate = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

/**
 * Deletes a file using a proxy server based on the specified request and response objects.
 *
 * @param {Request} req - The request object containing information about the file to delete.
 * @param {Response} res - The response object used to send the result of the file deletion attempt.
 * @return {Promise<void>} A Promise that resolves when the file deletion attempt is complete.
 */
const proxyFileDelete = async (req: Request, res: Response) => {
  const getServer = await groupNodeReturn(req.params.id);
  if (getServer !== null) {
    getServer.proxy(req, res);
  } else {
    res.status(400).send("No Active Servers");
  }
};

/**
 * Checks if a group is initialized and sends a response accordingly.
 *
 * @param {boolean} isGroup - A boolean indicating if the group is initialized.
 * @param {any} res - The response object to send the message to.
 * @return {void} No return value.
 */
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