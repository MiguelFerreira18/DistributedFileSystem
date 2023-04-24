import express from 'express';
import fileController from '../controllers/fileController'

const router = express.Router();


router.get('/',fileController.getPage)
router.get("/read/:fileKey",fileController.readFile)
router.post("/write/:fileKey",fileController.writeFile);
router.post('/update/:fileKey',fileController.updateFile);
router.post('/delete/:fileKey',fileController.deleteFile);

export default router;


