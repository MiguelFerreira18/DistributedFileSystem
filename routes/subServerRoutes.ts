import express from "express";
import subServerController from "../controllers/subServerController";

const router = express.Router();

router.use('/:serverId',subServerController.receiveId);

router.use('/CheckLeaderStatus',subServerController.CheckLeaderStatus);

export default router;
