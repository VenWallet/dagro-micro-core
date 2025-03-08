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


export default class P2pService {
  /*
  static async setOfferSell(seedPhrase: string, data: {
    contractId: string,
  }) {
    const privateKey = process.env.CREATE_NICKNAME_PRIVATEKEY!;
    const address =  process.env.CREATE_NICKNAME_ADDRESS!;
    
    const account = await walletUtils.nearConection(address, privateKey);

    
    const response2 = await account.functionCall({
      contractId: data.contractId,
      methodName: "create_account",
      args: {
        new_account_id: nickname,
        new_public_key: publicKey,
      },
      gas: "300000000000000",
      attachedDeposit: "200010000000000000000000",
    });
    
    if(response2.receipts_outcome[1].outcome.status.Failure !== undefined) {
      throw new Error ("Error: " + response2.receipts_outcome[1].outcome.status.Failure.toString())
    }

    return response2;
  }
*/
  
}