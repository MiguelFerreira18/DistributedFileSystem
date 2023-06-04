import express from "express";
import turnOnController from "../controllers/TurnOnController";


const router = express.Router();


router.get("/read", turnOnController.readLog);

export default router;