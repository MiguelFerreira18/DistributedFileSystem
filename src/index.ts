import express, { Express } from "express";
import bodyParser from "body-parser";
import { logger } from "../Modules/logger";
import fileRoutes from "../routes/fileRoutes";
import { mySubServers, subServer } from "../src/subGroup";
import axios from "axios";
import { has, toInteger } from "lodash";
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
/**
 * Check if server is reachable.
 * @throws {Error} if server is not reachable.
 */
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
/**
* Calls the given sub server and updates its status based on whether it was reached successfully or not
* @param {Object} element - The sub server object to call
* @param {string} element.serverAddress - The URL of the sub server
* @param {boolean} element.isOn - The current status of the sub server
*/
async function callSubServer(element: subServer) {
	try {
		await axios.get(element.serverAdress);
		console.log("Server " + element.serverAdress + " is reachable");
		hasCommunicated = true;
		element.isOn = true;
	} catch (err) {
		console.log("Server " + element.serverAdress + " is not reachable");
		element.isOn = false;
		//ERROR CALLING SUB SERVERS
		handleErrors("callSubServer", err, "../src/index.ts : 65");
	}
}

/**
 * Communicates with sub-servers if the current server is not a proxy.
 * @returns {Promise<void>}
 */
async function communicateWithSubServers() {
	// Check if the current server is not a proxy
	if (!db.isProxy) {

		// Call each filtered sub-server
		const promises = mySubServers
			.filter(
				(element) => element.serverAdress.search(PORT.toString()) < 0
			)
			.map(callSubServer);

		await Promise.all(promises);
	}
}

/**
 * Elects a leader server among a group of servers.
 * 
 * @returns {Promise<void>}
 */
async function electLeader() {
	console.log(mySubServers);
	
	// If the current server has not communicated yet and is not a proxy
	if (!hasCommunicated && !db.isProxy) {
		try {
			await axios.post("http://localhost:3000/api/init/1b02d8d2476", {
				server: `http://localhost:${PORT}/`,
			});
			console.log("Server " + PORT + " is the leader");

			// Find my server and set it as the leader
			const server = mySubServers.find((s) =>
				s.serverAdress.includes(PORT.toString())
			);
			if (server) {
				server.isLeader = true;
			}
		} catch (err) {
			console.log("Server " + PORT + " is not the leader");
			//PROBLEM ANNOUNCING THE LEADER
			handleErrors("electLeader", err, "../src/index.ts : 89");
		}
	} else if (hasCommunicated && !db.isProxy) {// If the current server has communicated and is not a proxy
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
					console.log("Done");
					if (res.status == 204) {
						console.log(
							"Server " +
								PORT +
								" is not the leader because the other has already talked"
						);
						return;
					} else if (res.data.becomeLeader && res.status == 200) {// If the response is a 200 and the server should become leader
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
							console.log(
								"HE REACHED THIS PLACE!!!!!!!!!!!!!!!!!!!!!!!!!!"
							);
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
						try {
							const c = await sendLeader();
						} catch (err) {
							console.log("um deles não está on");
						}
					} else if (!res.data.becomeLeader && res.status == 200) {//If the response is 200 and this server should not becomeLeader than it won't be the leader
						console.log("Server " + PORT + " is not the leader");

						console.log("Server " + PORT + " is not the leader");
						const myServer = mySubServers.find((s) =>
							s.serverAdress.includes(PORT.toString())
						);
						if (myServer) {
							myServer.isOn = true;
							myServer.response = true;
						}
						for (const server of mySubServers) //Limpa todos os servidores de serem liders
							server.isLeader = false;
						//Make this element tje new leader
						element.isLeader = true;
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
/**
 * Asynchronously retrieves logs from all subservers and stores them in an array.
 *
 * @return {void} No return value.
 */
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
/**
 * Sends the leader to all the subservers except the one running on PORT.
 *
 * @return {Promise<void>} A promise that resolves when all the subservers have received the leader.
 */
async function sendLeader() {
	console.log("send 1");
	const servers = mySubServers.filter(
		(element) => element.serverAdress.search(PORT.toString()) < 0
	);
	console.log("send 2");
	console.log(servers.length);
	for (const server of servers) {
		try {
			console.log("send 3");
			const res = await axios.post(
				`${server.serverAdress}election/sendLeader`,
				{
					//Send for the server and then update it
					servers: `http://localhost:${PORT}/`,
				}
			);
			console.log(res.data);
			console.log("send 4");
		} catch (error) {
			console.log(error);
		}
	}
}

/**
 * Asynchronously pings the leader server and logs whether the current
 * server is the leader or not. If the current server is not the leader, it
 * resets all the servers and elects a new leader.
 *
 * @return {Promise<void>} Returns nothing.
 */
async function pingLeader() {
	const server = mySubServers.find((element) => element.isLeader);
	if (server && server.serverAdress.search(PORT.toString()) < 0) {
		try {
			const serverResponse = await axios.get(`${server?.serverAdress}`);
			console.log("is Leader on: " + serverResponse.data);
		} catch (error) {
			console.log("is Leader on: " + false);
			//Mudar para ficar melhor
			//RESETA TUDO E FAZ A REILEIÇÃO
			for (const server of mySubServers) {
				server.isLeader = false;
				server.isOn = false;
				server.response = false;
			}
			hasCommunicated = false;
			db.serverId = toInteger(Math.random() * 10001);
			console.log(db.serverId);
			//SLeep the server for 3 seconds
			await new Promise((resolve) => setTimeout(resolve, 10000 - db.serverId));

			console.log("logger 1");
			await communicateWithSubServers();
			console.log("logger 2");
			await electLeader();
			console.log("logger 3");
		}
	}
}

/**
 * Initializes the server, reaching out to sub-servers and retrieving logs.
 *
 * @return {Promise<void>} A Promise that resolves when the server is fully initialized.
 */
async function initializeServer() {
	if (db.isProxy) {
		await reach();
		return;
	}
	await reach();
	console.log("log1");
	await communicateWithSubServers();
	console.log("log2");
	await electLeader(); //!TROCAR ISTO DEPOIS, TIRAR O COMENTÁRIO
	console.log("log3");
	await retreiveLogs();
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

	setInterval(async () => {
		await pingLeader();
	}, 2000);
});

export default app;
