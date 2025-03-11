import { Request, Response } from "express";
import P2ptService from "../services/p2p.service";
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


  static async createOrder(req: Request, res: Response) {
    try {
      const { seedPhrase, data } = req.body;
      
      if (!seedPhrase)
        throw ResponseUtils.error(ResponseCode.WARNING, "warning", "seedPhrase es requerido");

      /*seedPhrase: string, data: {
        offerId: number,
        paymentMethodId: number,
        amountOrder: string,
      }*/
      
      res.send(ResponseUtils.response(200, "ok", await P2ptService.createOrder(seedPhrase, data)));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }
  
  
  
  
}
