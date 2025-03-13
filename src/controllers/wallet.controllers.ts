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
import { functionCallInterface, walletInterface } from "../interfaces/wallet.interface";
import walletUtils from "../utils/wallet.utils";


interface AuthenticatedRequest extends Request {
  user?: Users;
  seedPhrase?: string;
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

  
  static async loginSeedPhrase(req: Request, res: Response) {
    try {
      const { seedPhrase } = req.body;
      
      if (!seedPhrase)
        throw ResponseUtils.error(ResponseCode.WARNING, "warning", "seedPhrase es requerido");
      
      res.send(ResponseUtils.response(200, "ok", await WalletService.loginSeedPhrase(seedPhrase)));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }


  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      res.send(ResponseUtils.response(200, "ok", await WalletService.getProfile(req.user?.wallet || "")));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }

  static async getHeadings(req: AuthenticatedRequest, res: Response) {
    try {
      res.send(ResponseUtils.response(200, "ok", await WalletService.getHeadings()));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(dataError.code).send(dataError);
    }
  }


  static async putProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if(!req.user?.wallet) throw ResponseUtils.error(ResponseCode.WARNING, "warning", "Usuario no registrado");

      upload.single('image')(req, res, async (err: any) => {
        if (err) return res.status(500).send(err?.message || err);
  
        try {
          const file = req?.file;
          
          let routeImage;
          if(file) {
            routeImage = await uploadImage(file, 'dagro/profile');
          }

          req.body.image = routeImage;

          const data = { ...req.body };

          
          return res.send(ResponseUtils.response(200, "ok", await WalletService.putProfile(req.seedPhrase! , data)));

        } catch (error: any) {
          const dataError: responseInterface = ResponseUtils.responseError(error);

          return res.status(dataError.code).send(dataError);
        }
      });
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log("aqui paso2", dataError);

      res.status(dataError.code).send(dataError);
    }
  }

  
  static async functionCall(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body;
      //const dataFinal: functionCallInterface = data as functionCallInterface;
      
      if(data.gas === null) {
        throw ResponseUtils.error(ResponseCode.WARNING, "warning", "gas debe ser string | undefined, no puede ser null ");
      }

      if(data.attachedDeposit === null) {
        throw ResponseUtils.error(ResponseCode.WARNING, "warning", "attachedDeposit debe ser string | undefined, no puede ser null ");
      }

      const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
        req.seedPhrase!
      );
    
      res.send(ResponseUtils.response(200, "ok", await WalletService.functionCall(walletData.address, walletData.secretKey, data)));
    } catch (error: any) {
      const dataError: responseInterface = ResponseUtils.responseError(error);
      console.log(dataError);

      res.status(500).send(error);
    }
  }
  
  
}
