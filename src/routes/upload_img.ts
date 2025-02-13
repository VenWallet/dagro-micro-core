import express from 'express';
const router = express.Router();
import uploadImgControllers from '../controllers/upload_img.controllers';
import multerConfig from "../config/multer";



router.post("/upload",
    multerConfig.upload.fields([
        { name: "imgDao", maxCount: 1 },
    ]), uploadImgControllers.uploadImg)





export { router }