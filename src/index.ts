import express, { Express } from 'express';
import dotenv from 'dotenv';
import module from '../config/module'
import bodyParser from "body-parser";
import {logger} from '../config/logger';
import fileRoutes from '../routes/fileRoutes'
import proxy from 'express-http-proxy';
import axios from 'axios';
import { map } from 'lodash';
import {groupMap,Group}from "../src/groups";
import proxyRoutes from '../routes/proxyRoutes'
import db from '../config/dbPardal.json'



dotenv.config();

const app: Express = express();


app.use(bodyParser.json())
const port = process.env.PORT || 8080;


app.get('/', (req, res) => {
  res.send("FileSystem");
})

//Routes for files manipulation
if (!db.isProxy) {
  app.use('/file', fileRoutes);
}else{
  app.use('/api',proxyRoutes)
}

app.listen(port, () => {
  logger.info("-------------------------------------------Server started---------------------------------------------");
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  //make a request to the server with port 3001 check if was nul, if it was the server is not reachable
  let get = axios.get('http://localhost:3001')
  get.then((res) => {
    console.log("Server 3001 is reachable");
  }
  ).catch((err) => {
    console.log("Server 3001 is not reachable");
  })

});

export default app;
