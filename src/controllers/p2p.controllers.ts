import { Request, Response } from "express";
//import WalletService from "../services/wallet.service";
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

export default class WalletController {
  
  static async status(req: Request, res: Response) {
    try {
      res.send(ResponseUtils.response(200, "ok", "todo bien"));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }

  
  
  
  
}
