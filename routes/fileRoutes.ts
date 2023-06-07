import express from 'express';
import fileController from '../controllers/fileController'


const router = express.Router();


router.get('/',fileController.getPage)
router.post('/receive/:fileName',fileController.receive);
router.get('/status',fileController.groupServerStatus);

router.get("/read/:fileName",fileController.readFile);
router.post("/write/:fileName",fileController.writeFile);
router.post('/update/:fileName',fileController.updateFile);
router.post('/delete/:fileName',fileController.deleteFile);

//router.post('/sendFile/:fileName',fileController.sendFile);

export default router;

