import { join } from "path";
import conf from "../dbPardal.json";
import dbKernel from "../Modules/module";
import crypto from "crypto";
import { mySubServers } from "../src/subGroup";
import { handleSuccess } from "../Modules/handleSucess";
import { handleErrors } from "../Modules/handleErrors";
import db from "../dbPardal.json"


/**
 * Sets the `isOn` property of the `db` object to false.
 *
 * @param {any} req - The request object.
 * @param {any} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the `isOn` property has been set to false.
 */
const turnOfNode = async (req: any, res: any) => {
    db.isOn = false;
};

/**
 * Asynchronously identifies a file from the request body using its fileName field, creates a 
 * digest of the file, reads it from the database using the digest, and sends a response with the 
 * server URL and a boolean indicating whether the file exists in the database or not.
 *
 * @param {any} req - The request object containing the file name in the body.
 * @param {any} res - The response object to send a response to.
 * @return {Promise<void>} - Returns nothing.
 */
const identifyFile = async (req: any, res: any) => {
    const {fileName} = req.body
    const md5 = await createDigest(fileName);
    const file = await dbKernel.read(md5);
    if(file){
        res.send({
            server:`http://localhost:${db.PORT}`,
            hasFile:true
        })
    }
};

/**
 * Retrieves the structure of the current system, consisting of a proxy and a list of nodes.
 * !Não está acabado por não saber quais são as rotas!
 * @param {any} req - the incoming request object
 * @param {any} res - the outgoing response object
 * @returns {Promise<void>} - returns nothing, as the result is sent through the response object
 */
const getStructure = async (req: any, res: any) => {
   
    let i = 0;
    for (const server of mySubServers){
        if(server.isLeader)
           return 
        i++;
    }
    const cena = {
        proxy: {
            ip: '127.0.0.1',
            port: 3000
        },
        nodes: [
            {
                '1b02d8d2476': {
                    hosts: [
                        { ip: '127.0.0.1', port: 3500 },
                        { ip: '127.0.0.1', port: 3501 },
                        { ip: '127.0.0.1', port: 3502 }
                    ],
                    master: i
                }
            }
        ]
    };

}
const createDigest = async (fileName: string) => {
	return crypto.createHash("md5").update(fileName).digest("hex");
};

export default {turnOfNode, identifyFile,getStructure}