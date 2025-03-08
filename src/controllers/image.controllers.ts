import { Request, Response } from "express";
import WalletService from "../services/wallet.service";
import axios from "axios";
import { Code } from "typeorm";
import { responseInterface } from "../interfaces/response.interface";
import ResponseUtils from "../utils/response.utils";
import { ResponseCode } from "../enums/response.enum";
import { Users } from "../entities";
import { uploadImage } from "../services/upload_image.service"; 
import multer from 'multer';
import { functionCallInterface } from "../interfaces/wallet.interface";


interface AuthenticatedRequest extends Request {
  user?: Users;
}

// Configurar multer para manejar la carga de archivos
const upload = multer({ dest: 'dagro/' });

export default class ImageController {
  
  static async status(req: Request, res: Response) {
    try {
      res.send(ResponseUtils.response(200, "ok", "todo bien"));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }


  static async uploadImage(req: AuthenticatedRequest, res: Response) {
    try {
      if(!req.user?.wallet) throw ResponseUtils.error(ResponseCode.WARNING, "warning", "Usuario no registrado");

      upload.single('image')(req, res, async (err: any) => {
        if (err) return res.status(500).send(err?.message || err);
  
        try {
          const file = req?.file;
          if(!file) throw  ResponseUtils.error(400, "warning", "imagen no encontrada");

          const routeImage = await uploadImage(file, 'dagro/others');
          
          return res.send(ResponseUtils.response(200, "ok", routeImage));

        } catch (error: any) {
          return res.status(500).send(error?.message || error);
        }
      });
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }  
  
}
