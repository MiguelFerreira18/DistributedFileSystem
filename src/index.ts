import express, { Express } from "express";
import dotenv from "dotenv";
import module from "../config/module";
import bodyParser from "body-parser";
import { logger } from "../config/logger";
import fileRoutes from "../routes/fileRoutes";
import { mySubServers, subServer } from "../src/subGroup";
import proxy from "express-http-proxy";
import axios from "axios";
import { has, map,toInteger} from "lodash";
import { groupMap, Group } from "../src/groups";
import proxyRoutes from "../routes/proxyRoutes";
import db from "../config/dbPardal.json";
import subServerRouter from "../routes/subServerRoutes";

dotenv.config();

const app: Express = express();

app.use(bodyParser.json());
const port = process.env.PORT || 8080;
let hasCommunicated = false;
let subServerOn: subServer[] = [];

app.get("/", (req, res) => {
  res.send("FileSystem");
});

//Routes for files manipulation
if (!db.isProxy) {
  app.use("/file", fileRoutes);
  app.use("/election", subServerRouter);
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
  }
}

async function callSubServer(element: subServer) {
  try {
    await axios.get(element.serverAdress);
    console.log("Server " + element.serverAdress + " is reachable");
    hasCommunicated = true;
    subServerOn.push(element);
  } catch (err) {
    console.log("Server " + element.serverAdress + " is not reachable");
  }
}

async function communicateWithSubServers() {
  if (!db.isProxy) {
    const promises = mySubServers
      .filter((element) => element.serverAdress.search(port.toString()) < 0)
      .map(callSubServer);

    await Promise.all(promises);
  }
}

async function electLeader() {
  if (!hasCommunicated && !db.isProxy) {
    try {
      await axios.post("http://localhost:3000/api/init/1b02d8d2476", {
        server: `http://localhost:${port}/`,
      });
      console.log("Server " + port + " is the leader");
    } catch (err) {
      console.log("Server " + port + " is not the leader");
    }
  } else if (hasCommunicated && !db.isProxy) {
    const promises = subServerOn.map(async (element) => {
      try {
        console.log(`${element.serverAdress}election/${db.serverId}`)
        const res = await axios.get(
          `${element.serverAdress}election/${db.serverId}`
        );
        
        if (res.data.becomeLeader) {
          try {
            
            await axios.post("http://localhost:3000/api/init/1b02d8d2476",{
                server: `http://localhost:${port}/`,
              });
            console.log("Server " + port + " is the leader");
          } catch (err) {
            console.log("Server " + port + " is not the leader");
          }
        }

        mySubServers.forEach((server) => {
          server.isLeader = server.serverAdress === res.data.myServer.serverAdress;
        });
      } catch (err) {
        console.log("Server " + port + " is not the leader");
      }
    });

    await Promise.all(promises);
  }
}

async function initializeServer() {
  await reach();
  console.log("log1")
  await communicateWithSubServers();
  console.log("log2")
  await electLeader();
  console.log("log3")
}

app.listen(port, async () => {
  db.serverId = toInteger(Math.random() * 10001);
  console.log(db.serverId);
  console.log(`my server Id is  ${db.serverId}`);
  logger.info(
    "-------------------------------------------Server started---------------------------------------------"
  );
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  await initializeServer();
});

export default app;
