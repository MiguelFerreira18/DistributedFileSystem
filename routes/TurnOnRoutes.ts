import express from "express";
import turnOnController from "../controllers/TurnOnController";


const router = express.Router();


router.get("/", turnOnController.receiveLog);

export default router;