import express, { Express } from 'express';
import dotenv from 'dotenv';
import module from '../config/module'
import bodyParser from "body-parser";
import {logger} from '../config/logger';
import fileRoutes from '../routes/fileRoutes'
import proxy from 'express-http-proxy';
import axios from 'axios';



dotenv.config();

const app: Express = express();

app.use('/newApi/*',proxy("http://localhost:3001/"))

app.use(bodyParser.json())
const port = process.env.PORT || 8080;


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
app.use('/file',fileRoutes)

app.listen(port, () => {
  logger.info("-------------------------------------------Server started---------------------------------------------");
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
