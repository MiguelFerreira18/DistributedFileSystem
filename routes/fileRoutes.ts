import express from 'express';
import fileController from '../controllers/fileController'


const router = express.Router();


router.get('/',fileController.getPage)
router.post('/init/:groupHash',fileController.init)
router.post('/sendFile/:fileKey',fileController.sendFile);
router.get("/read/:fileKey",fileController.readFile);
router.post("/write/:fileKey",fileController.writeFile);
router.post('/update/:fileKey',fileController.updateFile);
router.post('/delete/:fileKey',fileController.deleteFile);
router.get('/status',fileController.groupServerStatus);


export default router;

