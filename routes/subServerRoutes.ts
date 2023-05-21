import express from "express";
import subServerController from "../controllers/subServerController";

const router = express.Router();

router.use('/election/:serverId',subServerController.receiveId);

export default router;
