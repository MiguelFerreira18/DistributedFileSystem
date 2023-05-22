import { logger } from "../config/logger";
import { Request, Response } from "express";
import { mySubServers, subServer } from "../src/subGroup";
import db from "../config/dbPardal.json";

import axios from "axios";

/**
 * Receives the serverId of another server making the request and his server object, if the id of that server is bigger
 * than the response will send to that server that he is the lader of the group, if it's not bigger,
 * it will send to that server that he is not the leader
 *
 * @param req Received request object that has the server that sent the request and the ID that it has
 * @param res Response to be sent to that server
 */
const receiveId = async (req: Request, res: Response) => {
  try {
    const port = process.env.PORT || 8080;
    const { serverId } = req.params;
    const { server } = req.body;

    // Check if the serverId received is bigger than mine
    if (parseInt(serverId) > db.serverId) {
      mySubServers.forEach((element) => {
        if (element.serverAdress.search(port.toString()) < 0) {
          element.isLeader = false;
        }
        element.isLeader = true;
      });

      // Find my server
      const myServer = mySubServers.find((s) =>
        s.serverAdress.includes(port.toString())
      );

      // Send that the other server is the leader by having a bigger id
      res.status(200).send({
        message: "ServerId received",
        myServer: myServer,
        becomeLeader: true,
      });
    } else {
      // If the serverId received is smaller than mine, I'm the leader
      mySubServers.forEach((element) => {
        if (element.serverAdress.search(port.toString()) < 0) {
          element.isLeader = false;
        }
        element.isLeader = true;
      });

      // Find my server
      const myServer = mySubServers.find((s) =>
        s.serverAdress.includes(port.toString())
      );

      // Send that the other server is not the leader by having a smaller id
      res.status(200).send({
        message: "ServerId received",
        myServer: myServer,
        becomeLeader: false,
      });
      // Stablish the leader in the proxy
      axios.post("http://localhost:3000/api/init/1b02d8d2476",{
        server: `http://localhost:${port}/`,
      });
    }
  } catch (err) {
    res.status(500).send("Error receiving id");
  }
};

/*
//Receive if is leader or not
const election = async (req: Request, res: Response) => {
  try {
    const port = process.env.PORT || 8080;
    let becomeLeader = req.body.becomeLeader;
    //myServer == The other server from receivedId (ou seja o que mandou o request)
    let myServer = req.body.myServer;
    //find my server
    let myServerIndex = mySubServers.findIndex((s) => {
      return s.serverAdress.search(port.toString()) >= 0;
    });
    //atualiza o servidor do request
    mySubServers[myServerIndex] = myServer;
    //if The other server says i'm not the leader i will change my state in the list and and do nothing
    if (!becomeLeader) {
      //find my server
      let myServer = mySubServers.find((s) => {
        return s.serverAdress.search(port.toString()) >= 0;
      });
      if (myServer) myServer.isLeader = false;
    } else { //If the other server says i'm the leader i will change my state and i will make a request to the proxy to become the receiver
      //find my server
      let myServer = mySubServers.find((s) => {
        return s.serverAdress.search(port.toString()) >= 0;
      });
      if (myServer) myServer.isLeader = true;
      //Stablish the leader in the proxy
      axios({
        method: "post",
        url: "http://localhost:3000/api/init/1b02d8d2476",
      });
    }
    res.status(200).json({
      message: "ServerId received",
      becomeLeader: becomeLeader,
    });
  } catch (err) {
      res.status(500).send("Error receiving id");
    }
};
*/
export default { receiveId };
