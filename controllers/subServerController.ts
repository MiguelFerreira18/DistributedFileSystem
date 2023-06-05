import { logger } from "../config/logger";
import { Request, Response } from "express";
import { mySubServers, subServer } from "../src/subGroup";
import db from "../config/dbPardal.json";
import env from "../models/config";

import axios from "axios";

/**
 * Receives the serverId of another server making the request and his server object, if the id of that server is bigger
 * than the response will send to that server that he is the lader of the group, if it's not bigger,
 * it will send to that server that he is not the leader
 *
 * @param req Received request object that has the server that sent the request and the ID that it has
 * @param res Response to be sent to that server
 */
const receiveId = async (req: any, res: Response) => {
	try {
		console.log("1")
		const port = db.PORT;
		console.log("2")
		const { serverId } = req.params;
		console.log("3")
		const { server } = req.body;
		console.log("4")

		// Check if the serverId received is bigger than mine
		if (parseInt(serverId) > db.serverId) {
			console.log("5")
			// Find my server
			const myServer = mySubServers.find((s) =>
				s.serverAdress.includes(port.toString())
			);
			//if it has already communicated and is smaller
			if (myServer?.response) {
				console.log("6")
				res.status(204).send(
					"this node is smaller and already talked to someone bigger"
				);
				return;
			}
			console.log("7")
			console.log(mySubServers.length)
			mySubServers.forEach((element) => {
				console.log("7.1")
				console.log(server)
				console.log(element.serverAdress)
				console.log(element.serverAdress.search(server))
				if (element.serverAdress.search(server) >= 0) {
					console.log("7.2")
					element.isLeader = true;
				}
				if (element.serverAdress.search(port.toString()) >= 0) {
					console.log("7.3")
					element.response = true;
				}
				console.log("7.4")
				element.isLeader = false;
			});
			console.log("8")
			// Send that the other server is the leader by having a bigger id
			res.status(200).send({
				message: "ServerId received",
				myServer: myServer,
				becomeLeader: true,
			});
			console.log("9")
		} else {
			console.log("20")
			// Find my server
			const myServer = mySubServers.find((s) =>
				s.serverAdress.includes(port.toString())
			);
			// if the serverId received is smaller than mine and i have communicated
			if (myServer?.response) {
				res.status(200).send({
					message: "ServerId received",
					myServer: myServer,
					becomeLeader: false,
				});
				return;
			}

			// If the serverId received is smaller than mine, I'm the leader
			mySubServers.forEach((element) => {
				if (element.serverAdress.search(port.toString()) < 0) {
					element.isLeader = false;
				}
				element.isLeader = true;
			});

			// Send that the other server is not the leader by having a smaller id
			res.status(200).send({
				message: "ServerId received",
				myServer: myServer,
				becomeLeader: false,
			});
		}
	} catch (err) {
		res.status(500).send("Error receiving id");
		//ERROR RECEIVING THE ID OF OTHER SERVER.
	}
};

const sendServer = async(req:any,res:any)=>{
	const port = db.PORT;
	for (const element of mySubServers){
		if(element.serverAdress.search(port.toString())>=0){
			res.send(element)
		}
	}
}

//CheckLeaderStatus

const CheckLeaderStatus = async (req: any, res: any) => {
  console.log("reached")
	const port = db.PORT;
	const myServer = mySubServers.find((s) =>
		s.serverAdress.includes(port.toString())
	);
  res.status(200).send(myServer?.isLeader);
};

export default { receiveId,CheckLeaderStatus,sendServer };
