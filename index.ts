import express, { Express, Request, Response } from 'express';
import fs from "fs";
import { promisify } from "util";
import { join } from "path";
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const deleteFileAsync = promisify(fs.unlink);

const folderPath = "./files";


app.get('/', (req, res) => {
  res.send('GET request to the homepage')
})


app.get("/readFile/:fileName", async (req:any, res:any) => {
  const fileName = req.params.fileName;
  const filePath = join(folderPath, fileName);
  try {
    const data = await readFileAsync(filePath, "utf-8");
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error reading file");
  }
});

app.post("/writeFile/:fileName", async (req:any, res:any) => {
  const fileName = req.params.fileName;
  const filePath = join(folderPath, fileName);
  const data: String = JSON.stringify(req.body);
  try {
    await writeFileAsync(filePath, "new data", "utf-8");
    res.send("File saved successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error writing file");
  }
});


app.post('/deleteFile/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = join(folderPath, fileName);

    try {
        await deleteFileAsync(filePath);
        res.send("File deleted successfully");
      } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting file");
      }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
