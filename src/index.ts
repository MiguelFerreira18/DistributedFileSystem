import express, { Express } from "express";
import dotenv from "dotenv";
import module from "../config/module";
import bodyParser from "body-parser";
import { logger } from "../config/logger";
import fileRoutes from "../routes/fileRoutes";
import { mySubServers, subServer } from "../src/subGroup";
import proxy from "express-http-proxy";
import axios from "axios";
import { has, map } from "lodash";
import { groupMap, Group } from "../src/groups";
import proxyRoutes from "../routes/proxyRoutes";
import db from "../config/dbPardal.json";
import subServerRouter from "../routes/subServerRoutes";

dotenv.config();

const app: Express = express();

app.use(bodyParser.json());
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("FileSystem");
});

//Routes for files manipulation
if (!db.isProxy) {
  app.use("/file", fileRoutes);
  app.use("/election",subServerRouter)
} else {
  app.use("/api", proxyRoutes);
}

app.listen(port, () => {
  db.serverId = Math.random() * 10001;
  let subServerOn:subServer[] = []
  logger.info(
    "-------------------------------------------Server started---------------------------------------------"
  );
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  //Testa a conexão
  if (db.isProxy) {
    let get = axios.get("http://localhost:3001");
    get
      .then((res) => {
        console.log("Server 3001 is reachable");
      })
      .catch((err) => {
        console.log("Server 3001 is not reachable");
      });
  }
  let hasCommunicated = false;
  //Comunica com um dos servidores do seu grupo
  if (!db.isProxy) {
    for (let index = 0; index < mySubServers.length; index++) {
      const element: subServer = mySubServers[index];
      //Mandar o serverId para comparar
      if (element.serverAdress.search(port.toString()) < 0) {
        let get = axios.post(element.serverAdress);//mudar isto
        get
          .then((res) => {
            console.log("Server " + element.serverAdress + " is reachable");
            hasCommunicated = !hasCommunicated
            subServerOn.push(element)
          })
          .catch((err) => {
            console.log("Server " + element.serverAdress + " is not reachable");
          });
      }
    }
  }

  //Se não se comunicou com nenhum servidor, ele manda para o proxy a dizer que é o líder
  if (!hasCommunicated && !db.isProxy) {
    let get = axios.get("http://localhost:3001/api/init/1b02d8d2476" + port);
    get
      .then((res) => {
        console.log("Server " + port + " is the leader");
      })
      .catch((err) => {
        console.log("Server " + port + " is not the leader");
      });
  }else if(hasCommunicated && !db.isProxy){
    //do a foreach in each subServerOn and make a request to elect the leader
    subServerOn.forEach(element => {
      let get = axios.get(element.serverAdress+"/election/1b02d8d2476" + port);
      get
      .then((res) => {
        //update the server state received called myServer and if the becomeLeader is true send a axios request to the proxy to initialize the leader if not do nothing
        if(res.data.becomeLeader){
          let get = axios.post("http://localhost:3001/api/init/1b02d8d2476");
          get
          .then((res) => {
            console.log("Server " + port + " is the leader");
          })
          .catch((err) => {
            console.log("Server " + port + " is not the leader");
          });
        }
        //update this server to be the leader in the MysubServers
        mySubServers.forEach(element => {
          if(element.serverAdress === res.data.myServer.serverAdress){
            element.isLeader = true
          }else{
            element.isLeader = false
          }
        }) 
      })
      .catch((err) => {
        console.log("Server " + port + " is not the leader");
      });
    })


  }



});

export default app;
