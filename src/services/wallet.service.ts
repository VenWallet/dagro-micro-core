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

    let user = await Users.findOne({ where: { wallet: walletData.address } });

    if (!user) {
      user = new Users();
      user.wallet = walletData.address;
      user.save();
    }

    const token: string = await this.generateToken(walletData.address);

    return {
      token,
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
    wallet: string,
    data: {
      email?: string;
      name?: string;
      phoneNumber?: string;
      image?: string;
      headingQuantity?: string;
      heading?: number;
      ladnName?: string;
      landAddress?: string;
    }
  ): Promise<profileInterface> {

    let user = await Users.findOne({ where: { wallet: wallet }, relations: { heading: true } });
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
      wallet: wallet,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      image: user.image,
      headingQuantity: user.headingQuantity,
      heading: user?.heading.id,
      ladnName: user.ladnName,
      landAddress: user.landAddress,
    };
  }

  /* async verifyGoogle(token: string) {
    let response: any;

    await GoogleAuthUtils.verifyAccesGoogle(token).then(async (result: any) => {
      if (!result.payload["email_verified"])
        throw new Error("Error eL email no esta verificado");

      response = await walletUtils.emailRegistered(result.payload["email"]);
    });

    return response;
  } */

  /* async emailWalletImport(code: string, email: string) {
    await this.verifyCode(code, email);

    //const response = "funcion deprecada"

    const response = await walletUtils.emailRegistered(email);

    return response;
  } */

  /* async emailCreateNickname(code: string, email: string, nickname: string) {
    try {
      await this.verifyCode(code, email);

      const wallet = await Wallet.findOneBy({ email: email });

      if (!wallet) {
        throw new Error("Email is not registered");
      } else {
        // const response = await walletUtils.createNickname(nickname, email, cedula);
        // await Wallet.update({email:email}, {seedPhrase: encryp.encryp(response.seedPhrase), nickname: true})
        // response.isExists = true;

        return {};
      }
    } catch (err: any) {
      throw new Error(err.toString());
    }
  } */

  /*async downloadUsersAsExcel(res: Response) {
    await delay(3000);
    const wallets = await Wallet.find();

    if(!wallets) return [];

    const walletsList = wallets.map((element) => {
      return { 
        email: element?.email ? encryp.decryp(element.email) : "",
        cedula: element?.cedula ? encryp.decryp(element.cedula) : "",
        name: element?.name ? encryp.decryp(element.name) : "",
        walletname: element?.walletname ? encryp.decryp(element.walletname) : ""
      }
    });

    // Convertir los datos a un formato adecuado para Excel
    const worksheet = XLSX.utils.json_to_sheet(walletsList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Configurar la respuesta para descargar el archivo
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  }*/

  static async functionCall(seedPhrase: string, data: functionCallInterface) {
    const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
      seedPhrase
    );
    
    const account = await walletUtils.nearConection(walletData.address, walletData.secretKey);

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
