import express, { Express } from "express";
import bodyParser from "body-parser";
import { logger } from "../Modules/logger";
import fileRoutes from "../routes/fileRoutes";
import { mySubServers, subServer } from "../src/subGroup";
import axios from "axios";
import { toInteger } from "lodash";
import proxyRoutes from "../routes/proxyRoutes";
import db from "../dbPardal.json";
import subServerRouter from "../routes/subServerRoutes";
import { replicateFromLogs } from "../Modules/recuperateActions";
import logs from "../src/logs";
import TurnOnRoutes from "../routes/LoggerRoutes";
import { handleErrors } from "../Modules/handleErrors";

const app: Express = express();

app.use(bodyParser.json());
const PORT = db.PORT;
let hasCommunicated = false;

app.get("/", (req, res) => {
	res.send(true);
});

//Routes for files manipulation
if (!db.isProxy) {
	app.use("/file", fileRoutes);
	app.use("/election", subServerRouter);
	app.use("/logs", TurnOnRoutes);

	app.get("/check", async (req: any, res: any) => {
		try {
			console.log("reached");
			const port = db.PORT;
			for (const server of mySubServers) {
				console.log(server);
			}
			res.send("ok");
		} catch (err) {
			console.log("error");
		}
	});

	//Call the gossip protocol
} else {
	app.use("/api", proxyRoutes);
}

//see if server is reachable
async function reach() {
	try {
		if (db.isProxy) {
			await axios.get("http://localhost:3501");
		} else {
			await axios.get("http://localhost:3000");
			console.log("proxy is reachable");
		}
	} catch (err) {
		console.log("Server is not reachable");
		//POBLEM WHILE SEEING IF ITS REACHABLE IGNORE
		handleErrors("reach", err, "../src/index.ts : 52");
	}
}

async function callSubServer(element: subServer) {
	try {
		await axios.get(element.serverAdress);
		console.log("Server " + element.serverAdress + " is reachable");
		hasCommunicated = true;
		element.isOn = true;
	} catch (err) {
		console.log("Server " + element.serverAdress + " is not reachable");
		//ERROR CALLING SUB SERVERS
		handleErrors("callSubServer", err, "../src/index.ts : 65");
	}
}

async function communicateWithSubServers() {
	if (!db.isProxy) {
		const promises = mySubServers
			.filter(
				(element) => element.serverAdress.search(PORT.toString()) < 0
			)
			.map(callSubServer);

		await Promise.all(promises);
	}
}

async function electLeader() {
	console.log(mySubServers);
	if (!hasCommunicated && !db.isProxy) {
		try {
			await axios.post("http://localhost:3000/api/init/1b02d8d2476", {
				server: `http://localhost:${PORT}/`,
			});
			console.log("Server " + PORT + " is the leader");
		} catch (err) {
			console.log("Server " + PORT + " is not the leader");
			//PROBLEM ANNOUNCING THE LEADER
			handleErrors("electLeader", err, "../src/index.ts : 89");
		}
	} else if (hasCommunicated && !db.isProxy) {
		const promises = mySubServers
			.filter(
				(element) => element.serverAdress.search(PORT.toString()) < 0
			)
			.map(async (element) => {
				try {
					console.log(
						`${element.serverAdress}election/${db.serverId}`
					);
					const res = await axios.post(
						`${element.serverAdress}election/${db.serverId}`,
						{
							server: `http://localhost:${PORT}`,
						}
					);
					if (res.status == 204) {
						console.log(
							"Server " +
								PORT +
								" is not the leader because the other has already talked"
						);
						return;
					} else if (res.data.becomeLeader && res.status == 200) {
						try {
							for (const server of mySubServers) {
								server.isLeader = false;
							}
							// Find my server
							const server = mySubServers.find((s) =>
								s.serverAdress.includes(PORT.toString())
							);
							if (server != null) {
								server.isLeader = true;
							}

							await axios.post(
								"http://localhost:3000/api/init/1b02d8d2476",
								{
									server: `http://localhost:${PORT}/`,
								}
							);
							console.log("Server " + PORT + " is the leader");
						} catch (err) {
							console.log(
								"Server " + PORT + " is not the leader"
							);
							//PROBLEM ANNOUCING THE LEADER
							handleErrors(
								"electLeader",
								err,
								"../src/index.ts : 117"
							);
						}
					} else if (!res.data.becomeLeader && res.status == 200) {
						console.log("Server " + PORT + " is not the leader");

						console.log("Server " + PORT + " is not the leader");
						const myServer = mySubServers.find((s) =>
							s.serverAdress.includes(PORT.toString())
						);
						if (myServer) {
							myServer.isOn = true;
							myServer.response = true;
						}
					}
				} catch (err) {
					console.log("Server " + PORT + " is not the leader");
					//PROBLEM ANNOUNCING THE LEADER
					handleErrors("electLeader", err, "../src/index.ts : 140");
				}
			});

		await Promise.all(promises);
	}
}

async function retreiveLogs() {
	for (const element of mySubServers) {
		try {
			if (
				element.serverAdress.search(PORT.toString()) < 0 &&
				element.isOn
			) {
				const log = await axios.get(`${element.serverAdress}logs/read`);
				logs.push(log.data);
				console.log(log.data);
			}
		} catch (err) {
			console.log(err);
			//ERROR RETRIEVING LOGS
			handleErrors("retreiveLogsAxios", err, "../src/index.ts : 158");
		}
	}
	console.log("end of of for each");
	try {
		//await replicateFromLogs();
	} catch (err) {
		console.log(err);
		//ERROR RETRIEVING LOGS CHECK INSIDE
		handleErrors("retreiveLogsfunction", err, "../src/index.ts : 166");
	}
	console.log("end of method");
}
async function changeServersState() {
	for (const server of mySubServers) {
		if (server.isOn) {
			const res = await axios.post(
				`${server.serverAdress}election/sendServer`,
				{
					//Ask for the server and then update it
					servers: mySubServers,
				}
			);

			if (res.status == 200) {
				const receivedServer = res.data;
				server.isOn = true;
				server.isLeader = receivedServer.isLeader;
			}
		}
	}
}

async function initializeServer() {
	if (db.isProxy) {
		await reach();
		return;
	}
	await reach();
	console.log("log1");
	await communicateWithSubServers();
	console.log("log2");
	//await electLeader(); //!TROCAR ISTO DEPOIS, TIRAR O COMENTÁRIO
	console.log("log3");
	//await retreiveLogs();
	console.log("log4");
}

app.listen(PORT, async () => {
	db.serverId = toInteger(Math.random() * 10001);
	console.log(db.serverId);
	console.log(`my server Id is  ${db.serverId}`);
	logger.warn(
		"-------------------------------------------Server started---------------------------------------------"
	);
	console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);

	await initializeServer();
});

export default app;
