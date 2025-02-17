import { Request, Response } from "express";
import WalletService from "../services/wallet.service";
import axios from "axios";
import { Code } from "typeorm";
import { responseInterface } from "../interfaces/response.interface";
import ResponseUtils from "../utils/response.utils";
import { ResponseCode } from "../enums/response.enum";
import { Users } from "../entities";

interface AuthenticatedRequest extends Request {
  user?: Users;
}

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
  

  static async sendCode(req: Request, res: Response) {
    try {
      console.log(
        "ip: ",
        req.headers["x-forwarded-for"],
        req.connection.remoteAddress
      );
      const { email } = req.body;
      res.send({
        data: "deprecate", //await service.sendCode(email)
      });
    } catch (error: any) {
      console.log(error);
      let statusCode =
        error.message.split("-").length > 0
          ? Number(error.message.split("-")[0])
            ? Number(error.message.split("-")[0])
            : 500
          : 500;
      res.status(statusCode).send(error.message);
    }
  }

  static async sendCodeVerifyEmail(req: Request, res: Response) {
    try {
      const { email, cedula } = req.body;

      if (
        !["gmail.com", "dvconsultores.com", "metademocracia.social"].includes(
          email.toLowerCase().split("@")[1]
        )
      )
        throw new Error("400 - solo se permiten correos GMAIL");

      const ip: string | undefined = req.ip || req.connection.remoteAddress;

      if (!ip)
        throw new Error("400 - no se pudo obtener la direccion ip del cliente");

      /* async function isIpFromVenezuela(ip: string): Promise<boolean> {
        try {
            const response = await axios.get("https://api.ipgeolocation.io/getip", {
                params: {
                    apiKey: "799ac91bf6e747ad8b226deef4c57480",
                    ip: ip
                }
            });
    
            const countryCode = response.data.country_code2;
            return countryCode === 'VE';
        } catch (error) {
            console.error('Error fetching geolocation data:', error);
            return false;
        }
      }
      
      // Example usage:
      (async () => {
          const testIp = ip.split(':').length > 1 ? ip.split(':')[1] : ip ; // Replace with a sample IP address
          const result = await isIpFromVenezuela(testIp);
          console.log(`Is IP ${testIp} from Venezuela?, result`);
          throw
      })(); */

      res.send({
        data: {}, //await service.sendCodeVerifyEmail(email, cedula, ip)
      });
    } catch (error: any) {
      console.log(error);
      let statusCode =
        error.message.split("-").length > 0
          ? Number(error.message.split("-")[0])
            ? Number(error.message.split("-")[0])
            : 500
          : 500;
      res.status(statusCode).send(error.message || error);
    }
  }
}
