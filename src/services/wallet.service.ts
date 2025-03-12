import GoogleAuthUtils from "../utils/google_auth.utils";
import walletUtils from "../utils/wallet.utils";
import encryp from "../utils/encryp";
import { configNear } from "../config/nearConfig";
import { Not, In } from "typeorm";
// const myContractWasm  = require("../services/code/metadao_dao.wasm");
import * as XLSX from "xlsx";
import { Response } from "express";
import axios from "axios";
import { Headings, Users } from "../entities";
import {
  functionCallInterface,
  loginInterface,
  profileInterface,
  walletInterface,
} from "../interfaces/wallet.interface";
import ResponseUtils from "../utils/response.utils";
import { ResponseCode } from "../enums/response.enum";
import jwt from 'jsonwebtoken'; //  require('jsonwebtoken');

//funcion de delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*async function encryptBD() {
  console.log("---------------------------------------------")
  console.log("inicio encryptado")
  function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  await delay(5000);
  Wallet.find().then((wallets) => {
    wallets.forEach(async (element) => {
      console.log("element: ", element)
      await Wallet.update({ id: element.id }, { 
        email: encryp.encrypDES(element.email),
        cedula: encryp.encrypDES(element.cedula),
        name: encryp.encrypDES(element.name),
        walletname: encryp.encrypDES(element.walletname)
      });
    });
  });

  console.log("fin encryptado")
  console.log("---------------------------------------------")

}*/

export default class WalletService {
  
  static async generateToken(wallet: string): Promise<string> {
    const jwtSecret = process.env.JWT_SECRET || "secret";

    const token = jwt.sign(
      { 
        id: wallet,
      },
      jwtSecret!,
      // { expiresIn: '24h' }
    );

    return token;
  }

  static async loginSeedPhrase(seedPhrase: string): Promise<loginInterface> {
    const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
      seedPhrase
    );

    const token: string = await this.generateToken(walletData.address);
    const secret: string = encryp.generateSecretKey();
    const accessKey = encryp.encrypAES(seedPhrase, secret);

    let user = await Users.findOne({ where: { wallet: walletData.address } });

    if (!user) {
      user = new Users();
      user.wallet = walletData.address;
    }

    user.secret = secret;
    user.token = token;
    user.save();


    return {
      token: `${accessKey}.${token}`,
      wallet: walletData.address,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  }
  
  static async getProfile(wallet: string): Promise<profileInterface> {
    let user = await Users.findOne({ where: { wallet }, relations: { heading: true } });

    if (!user) throw ResponseUtils.error(ResponseCode.WARNING, "warning", "Usuario no registrado");

    return {
      wallet,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      image: user.image,
      headingQuantity: user.headingQuantity,
      heading: user.heading?.id,
      ladnName: user.ladnName,
      landAddress: user.landAddress,
    };
  }

  static async getHeadings() {
      const headings = await Headings.find({ where: { isActive: true } });
      return headings;
  }
  
  static async putProfile(
    seedPhrase: string,
    data: {
      email: string;
      name: string;
      phoneNumber?: string;
      image?: string;
      headingQuantity?: string;
      heading?: number;
      ladnName?: string;
      landAddress?: string;
    }
  ): Promise<profileInterface> {
    const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
      seedPhrase
    );

    await this.functionCall(
      walletData.address,
      walletData.secretKey,
      {
        contractId: process.env.CONTRACT_P2P || " ",
        methodName: "set_user",
        args: {
          name: data.name,
          last_name: data.name,
          phone: data?.phoneNumber || "000000",
          email: data.email,
          country: "VE",
          campo1: "",
          campo2: "",
          campo3: ""
        },
        gas: "300000000000000",
      } as functionCallInterface
    ).catch( async () => {
      await this.functionCall(
        walletData.address,
        walletData.secretKey,
        {
          contractId: process.env.CONTRACT_P2P || " ",
          methodName: "put_user",
          args: {
            name: data.name,
            last_name: data.name,
            phone: data?.phoneNumber || "000000",
            email: data.email,
            country: "VE"
          },
          gas: "300000000000000",
        } as functionCallInterface
      ).catch( async (error: any) => {
        throw ResponseUtils.responseError(error);  
      });
    });

    /*await account.functionCall({
      contractId: process.env.CONTRACT_P2P,
      methodName: "set_user",
      args: {
        name: data.name,
        last_name: data.name,
        phone: data?.phoneNumber || "000000",
        email: data.email,
        country: "VE",
        campo1: "",
        campo2: "",
        campo3: ""
      },
      gas: "300000000000000",
    }).catch( async (error: any) => {
      await account.functionCall({
        contractId: process.env.CONTRACT_P2P,
        methodName: "put_user",
        args: {
          name: data.name,
          last_name: data.name,
          phone: data?.phoneNumber || "000000",
          email: data.email,
          country: "VE",
        },
        gas: "300000000000000",
      }).catch( async (error: any) => {
        throw ResponseUtils.error(400, "Error", error);
      });
    });*/
    
    
    

    let user = await Users.findOne({ where: { wallet: walletData.address }, relations: { heading: true } });
    if (!user) throw ResponseUtils.error(400, "warning", "Usuario no registrado");

    if(data?.heading) {
      let headingData = await Headings.findOne({ where: { id: data.heading } });
      if (!headingData) throw ResponseUtils.error(400, "warning", "Rubro no registrado");

      user.heading = headingData;
    }

    user.email = data?.email || user.email;
    user.name = data?.name || user.name;
    user.phoneNumber = data?.phoneNumber || user.phoneNumber
    user.image = data?.image || user.image;
    user.headingQuantity = data?.headingQuantity || user.headingQuantity;
    user.ladnName = data?.ladnName || user.ladnName;
    user.landAddress = data?.landAddress || user.landAddress;

    user.save();

    return {
      wallet: walletData.address,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      image: user.image,
      headingQuantity: user.headingQuantity,
      heading: user?.heading?.id,
      ladnName: user.ladnName,
      landAddress: user.landAddress,
    };
  }
  

  static async functionCall(address: string, secretKey: string, data: functionCallInterface) {
    console.log("paso 1: ", address)
    const account = await walletUtils.nearConnection(address, secretKey);
    console.log("paso 3")
    let dataFunctionCall = {
      contractId: data.contractId,
      methodName: data.methodName,
      args: data.args,
      gas: data.gas,
      attachedDeposit: data.attachedDeposit,
    };
    
    let response2;
    try {
      response2 = await account.functionCall(dataFunctionCall);
    } catch (error: any) {
      console.log("error: ", error?.type)
      if(error?.type === "NotEnoughBalance") {
        throw ResponseUtils.error(400, "Error", "No hay suficiente balance");
      }
      if(error?.type === "KeyNotFound") {
        throw ResponseUtils.error(400, "Error", "Su cuenta esta inactiva, debe activarla con un deposito");
      }
      throw ResponseUtils.error(400, "Error", error);
    }
    
    /*if(response2?.receipts_outcome && response2?.receipts_outcome.length > 0) {
      if(response2.receipts_outcome[1].outcome.status.Failure !== undefined) {
        //throw new Error ("Error: " + response2.receipts_outcome[1].outcome.status.Failure.toString())
        throw ResponseUtils.error(400, "Error", response2);
      }
    }*/

    return response2;
  }
}
