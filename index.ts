import express, { Express } from 'express';
import dotenv from 'dotenv';
import module from './config/module'
import bodyParser from "body-parser";
import {logger} from './config/logger';
import fileRoutes from './routes/fileRoutes'


module.init()
dotenv.config();

const app: Express = express();
app.use(bodyParser.json())
const port = process.env.PORT;


//Routes for files manipulation
app.use('/file',fileRoutes)

app.listen(port, () => {
  logger.info("-------------------------------------------Server started---------------------------------------------");
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
