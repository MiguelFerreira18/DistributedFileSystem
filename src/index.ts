import express, { Express } from 'express';
import dotenv from 'dotenv';
import module from '../config/module'
import bodyParser from "body-parser";
import {logger} from '../config/logger';
import fileRoutes from '../routes/fileRoutes'
import proxy from 'express-http-proxy';
import axios from 'axios';
import { map } from 'lodash';



dotenv.config();

const app: Express = express();


app.use(bodyParser.json())
const port = process.env.PORT || 8080;

let servers: any[] = []

app.get('/', (req, res) => {
  res.send("FileSystem");
})

app.post('/initConn', function (req, res) {
  axios({
    method: 'post',
    url: 'http://localhost:3001/file/init/1b02d8d2476',
    data: {
      serverPort: 3002,
    }
  }).then(
    (response) => {
      console.log(response.data);
      res.send(response.data);
    }
  ).catch(
    (error) => {
      console.log(error);
    }
  );

})

//Routes for files manipulation
if (fileRoutes !== null) {
  app.use('/file', fileRoutes);
}

interface serverBody {
  id: string,
  host: string,
  port: number,
  usage: number,
}
//Route to receive a server 
app.post('/receiveServer', function (req, res) {
  const server = map(req.body, (server: serverBody) => {
    return {
      id: server.id,
      host: server.host,
      port: server.port,
      usage: server.usage,
      };
  });
  servers.push(server);
});
//remove server from servers array
app.post('/removeServer', function (req, res) {
  const server = map(req.body, (server: serverBody) => {
    return {
      id: server.id,
      host: server.host,
      port: server.port,
      usage: server.usage,
      };
  });
  servers = servers.filter((server) => server.id !== server.id);
});
//get the servers connected
app.get('/getServers', function (req, res) {
  //Make a table with console.table

  
  res.send(servers);
});






app.listen(port, () => {
  logger.info("-------------------------------------------Server started---------------------------------------------");
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
