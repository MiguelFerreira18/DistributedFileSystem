import express from "express";
import proxyController from '../controllers/proxyController'

const router = express.Router();

//Initialize the Leader of the group on the proxy
router.post("/init/:groupHash",proxyController.init);
router.get("/getServers", proxyController.getServers);

//CRUD
router.get("/file/read/:id", proxyController.proxyFileRead);
router.post("/file/write/:id",proxyController.proxyFileWrite);
router.post("/file/update/:id",proxyController.proxyFileUpdate);
router.post("/file/delete/:id", proxyController.proxyFileDelete);

export default router;
