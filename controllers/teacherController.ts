import { join } from "path";
import conf from "../dbPardal.json";
import dbKernel from "../Modules/module";
import crypto from "crypto";
import { mySubServers } from "../src/subGroup";
import { handleSuccess } from "../Modules/handleSucess";
import { handleErrors } from "../Modules/handleErrors";
import db from "../dbPardal.json"


const turnOfNode = async (req: any, res: any) => {
    db.isOn = false;
};

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

const getStructure = async (req: any, res: any) => {
    /*
     {
        proxy:
        {
            ip:ip da minha proxy,
            port: porta da minha proxy
        }
        nodes: ['abc':
            {
                hosts:
                    [
                        {ip:'127.0.0.1',port:3000},
                        {ip:'127.0.0.1',port:3001},
                        {ip:'127.0.0.1',port:3002}
                    ]
                    master: 2
    }
    */
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