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
import moment from "moment";
//funcion de delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
import gql from 'graphql-tag';
import { useQuery } from '../utils/graphql.utils';

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
  static async createOrder(seedPhrase: string, data: {
    offerId: number,
    paymentMethodId: number,
    amountOrder: number,
  }) {
    try {
      const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
        seedPhrase
      );

      //obtener balance near de la cuenta del usuario
      const balanceWallet: any = await walletUtils.getBalanceNear(walletData.address!);
      const balanceNear: string = balanceWallet.balanceAvalible;
        
      if (Number(balanceNear) < 0.0005) {
        throw ResponseUtils.error(400, 'warning', 'Deposite al menos 0.0005 NEAR para iniciar la transacción');
      }

      //buscar la oferta segun el typo y el id subministrado en el graph
      const queryOffer = `
        query MyQuery($offerId: ID!) {
          offerssell(id: $offerId) {
            exchange_rate
          }
        }
      `;
    
      const resultOffer = await useQuery({ query: queryOffer, variables: { offerId: data.offerId.toString() } })
      .catch((error) => { 
        throw ResponseUtils.error(400, 'warning', `Error al buscar la oferta - ${error}`);
      });


      const selectedOffer: {id: string, exchange_rate: string} = {
        id: data.offerId.toString(),
        exchange_rate: (resultOffer as { offerssell: { exchange_rate: string } }).offerssell.exchange_rate
      };




      //buscar el token seleccionado de una lista propia, consultar con andres
      const selectedToken: {decimals: number, contract: string, token: string} = {
        decimals: 6,
        contract: "usdt.tether-token.near",
        token: "USDT"
      };

      const addressShort =
        walletData.address!.split('.')[0].length >= 64
          ? walletUtils.shortenText(walletData.address!.split('.')[0], 30)
          : walletData.address!.split('.')[0];
      //console.log("address shorten: ", addressShort)
  
      const CONTRACT_NAME: string = process.env.CONTRACT_P2P!;
      const account = await walletUtils.nearConnection(walletData.address!, walletData.secretKey!);
      const amountOrderParse = walletUtils.parseTokenAmount(
        data.amountOrder,
        selectedToken.decimals,
      );
      let subcontract: any = {};
      //console.log("paso 1 ", `${addressShort}.${CONTRACT_NAME}`)
      let getTokenActivo = null;
      try {
        getTokenActivo = await account.viewFunction({
          contractId: selectedToken.contract,
          methodName: 'storage_balance_of',
          args: {
            account_id: `${addressShort}.${CONTRACT_NAME}`
          },
        });
      } catch (error) {
        console.log('error en getTokenActivo', error);
      }
  
      //console.log("paso 2 ", getTokenActivo)
      

      //console.log("paso 3")
      if (Number(balanceNear) < 0.0126 && getTokenActivo == null) {
        throw ResponseUtils.error(400, 'warning', 'Se requiere un balance mínimo de 0.0127 NEAR para iniciar por primera vez la transacción');
      }
      //console.log("paso 4")
      
      //console.log("paso 5")
      
      subcontract = await account.viewFunction({
        contractId: CONTRACT_NAME,
        methodName: 'get_subcontract',
        args: { user_id: walletData.address },
      });
      //console.log("paso 5.1 ", subcontract)
      
  
      //console.log("paso 6 ", subcontract?.contract)
      if (subcontract == null) {
        subcontract = { contract: `${addressShort}.${CONTRACT_NAME}` };
        await account.functionCall({
          contractId: CONTRACT_NAME,
          methodName: 'create_subcontract_user',
          gas: 30000000000000n,
          //args: { subaccount_id: subcontract?.contract, asset: "USDT" },
          attachedDeposit: 1n,
        });
        //console.log( "create_subcontract_user");
        //console.log(createSubCobtractUser);
      }
      //console.log("paso 7")
      if (getTokenActivo == null) {
        const activarSubcuenta = await account.functionCall({
          contractId: selectedToken.contract,
          methodName: 'storage_deposit',
          args: {
            account_id: subcontract?.contract,
          },
          gas: 30000000000000n,
          attachedDeposit: 1250000000000000000000n,
        });
        console.log('storage_deposit');
        console.log(activarSubcuenta);
      }
      //console.log("paso 8")
      
      await account.functionCall({
        contractId: selectedToken.contract,
        methodName: 'ft_transfer',
        gas: 15000000000000n,
        args: { receiver_id: subcontract?.contract, amount: amountOrderParse },
        attachedDeposit: 1n,
      });
      //console.log("ft_transfer");
      //console.log(ftTransfer)
      
      //console.log("paso 9")
      const acceptOffer: any = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: 'accept_offer',
        gas: 120000000000000n,
        args: {
          offer_type: 1,
          offer_id: parseInt(selectedOffer.id),
          amount: amountOrderParse,
          payment_method: parseInt(data.paymentMethodId.toString()),
          datetime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
          rate: parseFloat(selectedOffer.exchange_rate),
          assosiated: 'arepaWallet',
        },
        attachedDeposit: 1n,
      });
      //console.log("paso 10")
      if (!acceptOffer || acceptOffer.status?.SuccessValue !== '') {
        throw ResponseUtils.error(400, 'warning', `Error al aceptar la oferta - ${acceptOffer}`);
      }
      //console.log("paso 11")
      return true;
    } catch (error) {
      throw error;
    }
  }



  /* static async createOrder(seedPhrase: string, data: {
    offerId: number,
    paymentMethodId: number,
    amountOrder: string,
  }) {
    try {
      const typeOperation: String = "SELL";

      // TODO: obtener balance near de la cuenta del usuario
      const balanceNear: string = "1.1005"; 

      // TODO: buscar la oferta segun el typo y el id subministrado en el graph
      const selectedOffer: {id: string, exchange_rate: string} = {id: data.offerId.toString(), exchange_rate: "1"};


      // TODO: buscar el token seleccionado de una lista propia, consultar con andres
      const selectedToken: {decimals: number, contract: string, token: string} = {
        decimals: 6,
        contract: "usdt.tether-token.near",
        token: "USDT"
      };


      const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
        seedPhrase
      );

      const addressShort =
        walletData.address!.split('.')[0].length >= 64
          ? walletUtils.shortenText(walletData.address!.split('.')[0], 30)
          : walletData.address!.split('.')[0];
      //console.log("address shorten: ", addressShort)
  
      const CONTRACT_NAME: string = process.env.CONTRACT_P2P!;
      const account = await walletUtils.nearConnection(walletData.address!, walletData.secretKey!);
      const amountOrderParse = walletUtils.parseTokenAmount(
        data.amountOrder,
        selectedToken.decimals,
      );
      let subcontract: any = {};
      //console.log("paso 1 ", `${addressShort}.${CONTRACT_NAME}`)
      let getTokenActivo = null;
      try {
        getTokenActivo = await account.viewFunction({
          contractId: selectedToken.contract,
          methodName: 'storage_balance_of',
          args: {
            account_id:
              typeOperation == 'SELL'
                ? `${addressShort}.${CONTRACT_NAME}`
                : walletData.address,
          },
        });
      } catch (error) {
        console.log('error en getTokenActivo', error);
      }
  
      //console.log("paso 2 ", getTokenActivo)
      

      //console.log("paso 3")
      if (Number(balanceNear) < 0.0126 && getTokenActivo == null) {
        throw ResponseUtils.error(400, 'warning', 'Se requiere un balance mínimo de 0.0127 NEAR para iniciar por primera vez la transacción');
      }
      //console.log("paso 4")
      if (Number(balanceNear) < 0.0005) {
        throw ResponseUtils.error(400, 'warning', 'Deposite al menos 0.0005 NEAR para iniciar la transacción');
      }
      //console.log("paso 5")
      if (typeOperation == 'SELL') {
        subcontract = await account.viewFunction({
          contractId: CONTRACT_NAME,
          methodName: 'get_subcontract',
          args: { user_id: walletData.address },
        });
        //console.log("paso 5.1 ", subcontract)
      }
  
      //console.log("paso 6 ", subcontract?.contract)
      if (typeOperation == 'SELL' && subcontract == null) {
        subcontract = { contract: `${addressShort}.${CONTRACT_NAME}` };
        await account.functionCall({
          contractId: CONTRACT_NAME,
          methodName: 'create_subcontract_user',
          gas: 30000000000000n,
          //args: { subaccount_id: subcontract?.contract, asset: "USDT" },
          attachedDeposit: 1n,
        });
        //console.log( "create_subcontract_user");
        //console.log(createSubCobtractUser);
      }
      //console.log("paso 7")
      if (getTokenActivo == null) {
        const activarSubcuenta = await account.functionCall({
          contractId: selectedToken.contract,
          methodName: 'storage_deposit',
          args: {
            account_id:
              typeOperation == 'SELL' ? subcontract?.contract : walletData.address,
          },
          gas: 30000000000000n,
          attachedDeposit: 1250000000000000000000n,
        });
        console.log('storage_deposit');
        console.log(activarSubcuenta);
      }
      //console.log("paso 8")
      if (typeOperation == 'SELL') {
        await account.functionCall({
          contractId: selectedToken.contract,
          methodName: 'ft_transfer',
          gas: 15000000000000n,
          args: { receiver_id: subcontract?.contract, amount: amountOrderParse },
          attachedDeposit: 1n,
        });
        //console.log("ft_transfer");
        //console.log(ftTransfer)
      }
      //console.log("paso 9")
      const acceptOffer: any = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: 'accept_offer',
        gas: 120000000000000n,
        args: {
          offer_type: typeOperation == 'SELL' ? 1 : 2,
          offer_id: parseInt(selectedOffer.id),
          amount: amountOrderParse,
          payment_method: parseInt(data.paymentMethodId.toString()),
          datetime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
          rate: parseFloat(selectedOffer.exchange_rate),
          assosiated: 'arepaWallet',
        },
        attachedDeposit: 1n,
      });
      //console.log("paso 10")
      if (!acceptOffer || acceptOffer.status?.SuccessValue !== '') {
        throw ResponseUtils.error(400, 'warning', `Error al aceptar la oferta - ${acceptOffer}`);
      }
      //console.log("paso 11")
      return true;
    } catch (error) {
      throw error;
    }
  }
    */
  
}