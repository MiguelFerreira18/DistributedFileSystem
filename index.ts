import express, { Express, Request, Response } from 'express';
import fs from "fs";
import { promisify } from "util";
import { join } from "path";
import dotenv from 'dotenv';
import module from './module'
import bodyParser from "body-parser";
import {logger} from './logger';
import m0, { init, add, multiply } from "./reusable";



console.log(add(1,2))
module.init()

console.log(module)

dotenv.config();

const app: Express = express();
app.use(bodyParser.json())
const port = process.env.PORT;

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const appendFileAsync = promisify(fs.appendFile);
const deleteFileAsync = promisify(fs.unlink);

const folderPath = "./files";


app.get('/', (req, res) => {
  res.send('GET request to the homepage')
})


app.get("/readFile/:fileKey", async (req:any, res:any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  try {
    const data = await readFileAsync(filePath, "utf-8");
    logger.info('File read successfully with data: \n' + data + '\n from ' + filePath);
    const jsonData = JSON.parse(data);
    res.send(jsonData);
  } catch (err) {
    console.log(err);
    logger.error('Error reading file '+ err + ' from ' + filePath);
    res.status(500).send("Error reading file");
  }
});

app.post("/writeFile/:fileKey", async (req:any, res:any) => {
  const fileName = req.params.fileKey;
  const filePath = join(folderPath, fileName);
  const data: String = JSON.stringify(req.body);
  try {
    await appendFileAsync(filePath, JSON.stringify(data), "utf-8");
    logger.info('File saved successfully with data: \n' + data + '\n from ' + filePath);
    res.send("File saved successfully");
  } catch (err) {
    console.log(err);
    logger.error('Error writing file '+ err + ' from ' + filePath);
    res.status(500).send("Error writing file");
  }
});
app.post('/updateFile/:fileKey', async (req, res) => {
    const fileName = req.params.fileKey;
    const filePath = join(folderPath, fileName);
    const data: String = JSON.stringify(req.body);
    try {
      await writeFileAsync(filePath, JSON.stringify(data) , "utf-8");
      logger.info('File updated successfully with data: \n' + data + '\n from ' + filePath);
      res.send("File updated successfully");
    } catch (err) {
      console.log(err);
      logger.error('Error updating file '+ err + ' from ' + filePath);
      res.status(500).send("Error updating file");
    }
});


app.post('/deleteFile/:fileKey', async (req, res) => {
    const fileName = req.params.fileKey;
    const filePath = join(folderPath, fileName);

    try {
        await deleteFileAsync(filePath);
        logger.info('File deleted successfully from ' + filePath);
        res.send("File deleted successfully");
      } catch (err) {
        console.log(err);
        logger.error('Error deleting file '+ err + ' from ' + filePath);
        res.status(500).send("Error deleting file");
      }
});




app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
