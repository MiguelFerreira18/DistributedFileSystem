import {logger} from '../config/logger'
import {join} from 'path'
import fs from 'fs'
import {promisify} from 'util'
import conf from '../config/dbPardal.json'



const folderPath = join(conf.home,conf.dbDir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const appendFileAsync = promisify(fs.appendFile);
const deleteFileAsync = promisify(fs.unlink);

const getPage = (req:any,res:any) => {
    res.send('GET request to the homepage')
}
const readFile = async (req:any,res:any)  => {
    const fileName = req.params.fileKey;
    const filePath = join(folderPath, fileName);
    try {
      const data:string = await readFileAsync(filePath, "utf-8");
      handleSuccess(1,filePath,data)
      const jsonData = JSON.parse(data);
      res.send(jsonData);
    } catch (err) {
      console.log(err);
      handleErrors(1,err,filePath)
      res.status(500).send("Error reading file");
    }
}
const writeFile = async (req:any,res:any) => {
    const fileName = req.params.fileKey;
    const filePath = join(folderPath, fileName);
    const data: string = JSON.stringify(req.body);
    try {
      await appendFileAsync(filePath, data, "utf-8");
      handleSuccess(2,filePath,data)
      res.send("File saved successfully");
    } catch (err) {
      console.log(err);
      handleErrors(2,err,filePath)
      res.status(500).send("Error writing file");
    }
}
const updateFile = async (req:any,res:any) => {
    const fileName = req.params.fileKey;
    const filePath = join(folderPath, fileName);
    const data: string = JSON.stringify(req.body);
    try {
      await writeFileAsync(filePath, JSON.stringify(data) , "utf-8");
      handleSuccess(3,filePath,data)
      res.send("File updated successfully");
    } catch (err) {
      console.log(err);
      handleErrors(3,err,filePath)
      res.status(500).send("Error updating file");
    }
}
const deleteFile = async (req:any,res:any) => {
    const fileName = req.params.fileKey;
    const filePath = join(folderPath, fileName);
    try {
      await deleteFileAsync(filePath);
      handleSuccess(4,filePath)
      res.send("File deleted successfully");
    } catch (err) {
      console.log(err);
      handleErrors(4,err,filePath)
      res.status(500).send("Error deleting file");
    }
}

const handleErrors = async (errorLevel:number,err:unknown,filePath:string) =>{
    switch(errorLevel){
        case 1:
            logger.error('Error reading file '+ err + ' from ' + filePath);
            break;
        case 2:
            logger.error('Error writing file '+ err + ' from ' + filePath);
            break;
        case 3:
            logger.error('Error updating file '+ err + ' from ' + filePath);
            break;
        case 4:
            logger.error('Error deleting file '+ err + ' from ' + filePath);
            break;
        default:
            logger.error('Error '+ err + ' from ' + filePath);
            break;
    }
}
const handleSuccess = async (successLevel:number,filePath:string,data?:string) =>{
    switch(successLevel){
        case 1:
            logger.info('File read successfully with data: \n' + data + '\n from ' + filePath);
            break;
        case 2:
            logger.info('File saved successfully with data: \n' + data + '\n from ' + filePath);
            break;
        case 3:
            logger.info('File updated successfully with data: \n' + data + '\n from ' + filePath);
            break;
        case 4:
            logger.info('File deleted successfully from ' + filePath);
            break;
        default:
            logger.info('Success from ' + filePath);
            break;
    }
}

export default {getPage,readFile,writeFile,updateFile,deleteFile}