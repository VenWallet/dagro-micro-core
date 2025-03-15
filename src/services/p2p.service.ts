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

      const CONTRACT_NAME: string = process.env.CONTRACT_P2P!;
      const account = await walletUtils.nearConnection(walletData.address!, walletData.secretKey!);
      //buscar el token seleccionado de una lista propia, consultar con andres
      const selectedToken: {decimals: number, contract: string, token: string} = {
        decimals: 6,
        contract: "usdt.tether-token.near",
        token: "USDT"
      };
      const amountOrderParse = walletUtils.parseTokenAmount(
        data.amountOrder,
        selectedToken.decimals,
      );


      //buscar la oferta segun el typo y el id subministrado en el graph
      const queryOffer = `
        query MyQuery($offerId: ID!) {
          offerssell(id: $offerId) {
            exchange_rate
            remaining_amount
          }
        }
      `;
    
      
      const resultOffer = await useQuery({ query: queryOffer, variables: { offerId: data.offerId.toString() } })
      .catch((error) => { 
        throw ResponseUtils.error(400, 'warning', `Error al buscar la oferta - ${error}`);
      });


      if(BigInt(resultOffer?.offerssell?.remaining_amount) < BigInt(data.amountOrder)) { 
        throw ResponseUtils.error(400, 'warning', 'La cantidad de la orden es mayor a la cantidad disponible en la oferta'); 
      }

      const selectedOffer: {id: string, exchange_rate: string} = {
        id: data.offerId.toString(),
        exchange_rate: resultOffer?.offerssell?.exchange_rate
      };
      

      const addressShort =
        walletData.address!.split('.')[0].length >= 64
          ? walletUtils.shortenText(walletData.address!.split('.')[0], 30)
          : walletData.address!.split('.')[0];
      //console.log("address shorten: ", addressShort)


  
      
      let subcontract: any = {};
      //console.log("paso 1 ", `${addressShort}.${CONTRACT_NAME}`)
      let getTokenActivo = null;
      let getTokenActivo2 = null;
      try {
        getTokenActivo = await account.viewFunction({
          contractId: selectedToken.contract,
          methodName: 'storage_balance_of',
          args: {
            account_id: `${addressShort}.${CONTRACT_NAME}`
          },
        });

        getTokenActivo2 = await account.viewFunction({
          contractId: selectedToken.contract,
          methodName: 'storage_balance_of',
          args: {
            account_id: walletData.address
          },
        });
      } catch (error) {
        console.log('error en getTokenActivo', error);
      }
  
      //console.log("paso 2 ", getTokenActivo)
      //console.log("paso 3", getTokenActivo2)

      if (Number(balanceNear) < 0.0126 && (getTokenActivo === null || getTokenActivo2 === null)) {
        throw ResponseUtils.error(400, 'warning', 'Se requiere un balance mínimo de 0.0127 NEAR para iniciar por primera vez la transacción');
      }
      //console.log("paso 4")
      
      
      subcontract = await account.viewFunction({
        contractId: CONTRACT_NAME,
        methodName: 'get_subcontract',
        args: { user_id: walletData.address },
      });
      //console.log("paso 4.1 ", subcontract)
      
  
      //console.log("paso 6 ", subcontract?.contract)
      if (subcontract === null) {
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
      
      //console.log("paso 5: ", subcontract)

      if (getTokenActivo === null) {
        const activarSubcuenta = await account.functionCall({
          contractId: selectedToken.contract,
          methodName: 'storage_deposit',
          args: {
            account_id: subcontract?.contract,
          },
          gas: 30000000000000n,
          attachedDeposit: 1250000000000000000000n,
        });

        //console.log('storage_deposit 1:', activarSubcuenta);
      }
      if (getTokenActivo2 === null) {
        const activarCuenta = await account.functionCall({
          contractId: selectedToken.contract,
          methodName: 'storage_deposit',
          args: {
            account_id: walletData.address,
          },
          gas: 30000000000000n,
          attachedDeposit: 1250000000000000000000n,
        });

        //console.log('storage_deposit 2: ', activarCuenta);
      }
      //console.log("paso 8")
      
      await account.functionCall({
        contractId: selectedToken.contract,
        methodName: 'ft_transfer',
        gas: 15000000000000n,
        args: { receiver_id: subcontract?.contract, amount: amountOrderParse },
        attachedDeposit: 1n,
      });
      //console.log("ft_transfer: ", ftTransfer);
      //console.log("subcontract.contract :", subcontract?.contract)
      //console.log("amountParse: ", amountOrderParse)
      
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
      
      function validJson(data: string) {
        try {
          JSON.parse(data)?.params
          return JSON.parse(data)?.params ? true : false;
        } catch {
          return false
        }
      }

      const dataLogs: any = acceptOffer.receipts_outcome.find((item: any) => item?.outcome?.logs.length > 0 && validJson(item?.outcome?.logs[0]))
      let dataOrder;
      
      
      if(!dataLogs) throw ResponseUtils.error(500, "unexpected smart contract error", walletUtils.extractNearErrorMessage(acceptOffer) || acceptOffer); 
      
      dataOrder = dataLogs.outcome.logs[0];
      

    

      return dataOrder;

    } catch (error) {
      const errorNear = walletUtils.extractNearErrorMessage(error);
      if(errorNear)
        throw ResponseUtils.error(500, "smart contract error", errorNear);

      throw error;
    }
  }


  static async aproveOrder(seedPhrase: string, orderId: number): Promise<string> {
    try {
      const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
        seedPhrase
      );
      
      //const val = data.typeOperation === "SELL" ? "1" : "2";
      //const type = data.typeOperation === "SELL" ? "VENTA" : "COMPRA";// sessionStorage.getItem('operation') === "SELL" ? "VENTA" : "COMPRA";
      const val = "1"
      const type = "VENTA"
      const CONTRACT_NAME: string = process.env.CONTRACT_P2P!;
      
      const account = await walletUtils.nearConnection(walletData.address!, walletData.secretKey!);
  
      const orderConfirmation: any = await account.functionCall({
        contractId: CONTRACT_NAME!,
        methodName: "order_confirmation",
        gas: 180000000000000n,
        args: {
          offer_type: parseInt(val),
          order_id: parseInt(orderId.toString()),
        },
        attachedDeposit: 3n
      }) 
  
      if (!orderConfirmation || orderConfirmation.status.SuccessValue !== "") {
        throw ResponseUtils.error(400, 'warning', `Error confirmando la ${type}`);
      }
  
      
      try {
        const contract = await account.viewFunction({
          contractId: CONTRACT_NAME!,
          methodName: "get_subcontract_type",
          args: { user_id: walletData.address },
        });
  
        let deleteContract: any;
        if(contract !== 1 && val === "1"){
          deleteContract = await account.functionCall({
            contractId: CONTRACT_NAME!,
            methodName: "delete_contract",
            gas: 150000000000000n,
            args: {},
          });
  
          if (!deleteContract || deleteContract.status.SuccessValue !== "") {
            console.log("Error borrando el contrato");
          }
        }
        
      }
      catch (error) {
        console.log("Error borrando el contrato", error);
      }
  
      // const explorerLink = `https://nearblocks.io/es/txns/${orderConfirmation.transaction.hash}`;
      const explorerLink = `https://pikespeak.ai/transaction-viewer/${orderConfirmation.transaction.hash}`;
  
      //await sendMail({ typeOperation: data.typeOperation, orderId: data.orderId, type: sendMailTypeEnum.APPROVE }).catch((error) => { console.log("error envio correo approved", error) });
  
      return explorerLink;
    } catch (error) {
      throw error
    }
  }
  


  
  static async cancelOrder(seedPhrase: string, orderId: string) {
    try {
      const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
        seedPhrase
      );

      const typeDesc = "VENTA";
      const account = await walletUtils.nearConnection(walletData.address!, walletData.secretKey!);
      const CONTRACT_NAME: string = process.env.CONTRACT_P2P!;

      const orderConfirmation: any = await account.functionCall({
        contractId: CONTRACT_NAME!,
        methodName: "cancel_order",
        gas: 180000000000000n,
        args: {
          offer_type: 1,
          order_id: parseInt(orderId.toString()),
        },
        attachedDeposit: 3n
      });
      
      
      // console.log("orderConfirmation", orderConfirmation)
      if (!orderConfirmation || orderConfirmation.status.SuccessValue !== "") {
        throw ResponseUtils.error(400, 'warning', `Error al cancelar la ${typeDesc}`);
      }

      //await sendMail({ typeOperation: data.typeOperation, orderId: data.orderId, type: sendMailTypeEnum.CANCEL }).catch((error) => { console.log("error envio correo cancel", error) });

      return true;
    } catch (error) {
      throw error
    }
  }

  static async disputeOrder(seedPhrase: string, orderId: number) {
    try {
      const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
        seedPhrase
      );
      
      const typeDesc = "VENTA";
      const account = await walletUtils.nearConnection(walletData.address!, walletData.secretKey!);
      const CONTRACT_NAME: string = process.env.CONTRACT_P2P!;

      const orderConfirmation: any = await account.functionCall({
        contractId: CONTRACT_NAME!,
        methodName: "order_dispute",
        gas: 40000000000000n,
        args: {
          offer_type: 1,
          order_id: parseInt(orderId.toString())
        },
        attachedDeposit: 3n
      });

      // console.log("orderConfirmation", orderConfirmation)
      if (!orderConfirmation || orderConfirmation.status.SuccessValue !== "") {
        throw ResponseUtils.error(400, 'warning', `Error al disputar la ${typeDesc}`);
      }

      //await sendMail({ typeOperation: data.typeOperation, orderId: data.orderId, type: sendMailTypeEnum.DISPUTE }).catch((error) => { console.log("error envio correo dispute", error) });

      return true;
      //router.push({ name: 'HomePage' });
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

function algo() {
const aa =  {
  "final_execution_status": "EXECUTED",
  "receipts_outcome": [
      {
          "block_hash": "9WPa69JHZjv47cqsBLXkwQBvckQJccVQd6jcpmPPiw7x",
          "id": "xcjRAcHJkZMZUEcaNX2Qt8cxmm3WNxCMsDgz7iBmKmG",
          "outcome": {
              "executor_id": "v1.dagro.near",
              "gas_burnt": 3927482393192,
              "logs": [],
              "metadata": {
                  "gas_profile": [
                      {
                          "cost": "FUNCTION_CALL_BASE",
                          "cost_category": "ACTION_COST",
                          "gas_used": "400000000000"
                      },
                      {
                          "cost": "FUNCTION_CALL_BYTE",
                          "cost_category": "ACTION_COST",
                          "gas_used": "4861211574"
                      },
                      {
                          "cost": "NEW_ACTION_RECEIPT",
                          "cost_category": "ACTION_COST",
                          "gas_used": "289092464624"
                      },
                      {
                          "cost": "BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "10590724440"
                      },
                      {
                          "cost": "CONTRACT_LOADING_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "35445963"
                      },
                      {
                          "cost": "CONTRACT_LOADING_BYTES",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "1149786819235"
                      },
                      {
                          "cost": "READ_CACHED_TRIE_NODE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "15960000000"
                      },
                      {
                          "cost": "READ_MEMORY_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "46977537600"
                      },
                      {
                          "cost": "READ_MEMORY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "6063126135"
                      },
                      {
                          "cost": "READ_REGISTER_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "27688817046"
                      },
                      {
                          "cost": "READ_REGISTER_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "158389134"
                      },
                      {
                          "cost": "STORAGE_READ_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "450854765992"
                      },
                      {
                          "cost": "STORAGE_READ_KEY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "6283364199"
                      },
                      {
                          "cost": "STORAGE_READ_VALUE_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "7457024316"
                      },
                      {
                          "cost": "STORAGE_WRITE_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "64196736000"
                      },
                      {
                          "cost": "STORAGE_WRITE_EVICTED_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "20876249550"
                      },
                      {
                          "cost": "STORAGE_WRITE_KEY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "352414335"
                      },
                      {
                          "cost": "STORAGE_WRITE_VALUE_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "20162050350"
                      },
                      {
                          "cost": "TOUCHING_TRIE_NODE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "177121515186"
                      },
                      {
                          "cost": "UTF8_DECODING_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "6223558122"
                      },
                      {
                          "cost": "UTF8_DECODING_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "10205316765"
                      },
                      {
                          "cost": "WASM_INSTRUCTION",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "243109588392"
                      },
                      {
                          "cost": "WRITE_MEMORY_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "33645538332"
                      },
                      {
                          "cost": "WRITE_MEMORY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "4420681956"
                      },
                      {
                          "cost": "WRITE_REGISTER_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "34386269832"
                      },
                      {
                          "cost": "WRITE_REGISTER_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "8580129948"
                      }
                  ],
                  "version": 3
              },
              "receipt_ids": [
                  "CoXpgnnqz2PeMPpVT6wh2X2qqojoVQhsy1KHGJr2QjhT",
                  "2acD27s4M9h8BSKMbh87c6WKibXcmrBk7HYcfPsnHxQw",
                  "j5nL5fST6BdAHgnb2GeZvNdv6VjWoRuYpwoprCpm6Ty"
              ],
              "status": {
                  "SuccessValue": ""
              },
              "tokens_burnt": "392748239319200000000"
          },
          "proof": [
              {
                  "direction": "Left",
                  "hash": "7AN5JYj4DS38kHkVVWwY67AU7ADWv3bG4VoUFALcT41o"
              },
              {
                  "direction": "Right",
                  "hash": "EJSFZCHNSPncoiKHiggWvk2PQMVcTjkSk6LY8HCuzS4C"
              },
              {
                  "direction": "Right",
                  "hash": "45fjHVkGgu3iDEBdbLoSsmj42ZAYuhPaYBc98rhj7rhG"
              },
              {
                  "direction": "Right",
                  "hash": "DnrC28yW7UMFK9FsB8sZKMoWYuKNoqvaxUgWpU6SBkQk"
              },
              {
                  "direction": "Right",
                  "hash": "BpPsdXz2QvNzK53wsYENvymsRi7EnBpvWgURWT2AwZzx"
              },
              {
                  "direction": "Right",
                  "hash": "FREq6w1v3G2ruxyTnjg2fxUUpB6yEufoYybKvmRmNtLh"
              },
              {
                  "direction": "Right",
                  "hash": "5vPDBffNs6NG5KcjYds6FfmA1ZfihyCvU897GZptZPxA"
              }
          ]
      },
      {
          "block_hash": "E6CFPg24B2bQ1aiCeD5KsXq4RQEDC7uPZZ8B5zULa1Ev",
          "id": "CoXpgnnqz2PeMPpVT6wh2X2qqojoVQhsy1KHGJr2QjhT",
          "outcome": {
              "executor_id": "usdt.tether-token.near",
              "gas_burnt": 1370917059341,
              "logs": [],
              "metadata": {
                  "gas_profile": [
                      {
                          "cost": "NEW_DATA_RECEIPT_BYTE",
                          "cost_category": "ACTION_COST",
                          "gas_used": "584061534"
                      },
                      {
                          "cost": "BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "2647681110"
                      },
                      {
                          "cost": "CONTRACT_LOADING_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "35445963"
                      },
                      {
                          "cost": "CONTRACT_LOADING_BYTES",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "302512471630"
                      },
                      {
                          "cost": "READ_MEMORY_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "7829589600"
                      },
                      {
                          "cost": "READ_MEMORY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "239483979"
                      },
                      {
                          "cost": "READ_REGISTER_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "7551495558"
                      },
                      {
                          "cost": "READ_REGISTER_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "18431094"
                      },
                      {
                          "cost": "STORAGE_READ_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "112713691498"
                      },
                      {
                          "cost": "STORAGE_READ_KEY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "1671436782"
                      },
                      {
                          "cost": "STORAGE_READ_VALUE_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "706986504"
                      },
                      {
                          "cost": "WASM_INSTRUCTION",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "27953135100"
                      },
                      {
                          "cost": "WRITE_MEMORY_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "8411384583"
                      },
                      {
                          "cost": "WRITE_MEMORY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "509345364"
                      },
                      {
                          "cost": "WRITE_REGISTER_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "8596567458"
                      },
                      {
                          "cost": "WRITE_REGISTER_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "710892468"
                      }
                  ],
                  "version": 3
              },
              "receipt_ids": [
                  "EsHjQiEuJN14y9XSfp5DQDRtUhG7wnMuEvzypfiWeEK"
              ],
              "status": {
                  "SuccessValue": "IjUwMDAwMDAi"
              },
              "tokens_burnt": "137091705934100000000"
          },
          "proof": [
              {
                  "direction": "Right",
                  "hash": "9QgE4meCHGNSu1ktF8ToWv66NtCsV1qf4RFGe1xAqq2X"
              },
              {
                  "direction": "Right",
                  "hash": "86FpAfmVXr27cYXwofm941yKEy7Gq4EJeMCLupN8uj7z"
              },
              {
                  "direction": "Right",
                  "hash": "4XjdzBmQ1AzwN5X3U9hhEAhtXpLcmqXj5PAGwa9RaEy7"
              },
              {
                  "direction": "Left",
                  "hash": "A2NUajFmwG2E7PLsLmk7VeEJnVredvBnSjA6B4Gp7csW"
              },
              {
                  "direction": "Right",
                  "hash": "niDrvviTWbCD7knnTPhGVA9rqWbQWaUuzMrfUCm1fJy"
              },
              {
                  "direction": "Left",
                  "hash": "713h9y3sDYTFPJ3hkauw6U4qun8i6qFweV1XYV4aytbi"
              }
          ]
      },
      {
          "block_hash": "2qEVDKL65Chz3Rm3qmxUT11GrSGPG6UTztZFkgME4XFZ",
          "id": "EsHjQiEuJN14y9XSfp5DQDRtUhG7wnMuEvzypfiWeEK",
          "outcome": {
              "executor_id": "956eec3d0f70b088700bdc26c8048987cead33ab91bc104fd2234609d15a518b",
              "gas_burnt": 4174947687500,
              "logs": [],
              "metadata": {
                  "gas_profile": [],
                  "version": 3
              },
              "receipt_ids": [],
              "status": {
                  "SuccessValue": ""
              },
              "tokens_burnt": "0"
          },
          "proof": [
              {
                  "direction": "Left",
                  "hash": "DXxdooUTTyvtGvtNyjuFBPHa2ibVzNsZ89XMhA3BJoXW"
              },
              {
                  "direction": "Left",
                  "hash": "AVqJhSE8BfeBJ9ePPuMWhYJ3zu9zydNirv2jcj8uYLJj"
              },
              {
                  "direction": "Right",
                  "hash": "6UXHkXKYXZrTqQD3cMj91nyHFNqeFDthh3PxU4B49Kq7"
              },
              {
                  "direction": "Left",
                  "hash": "912ZuHfE9UvP2kNh4JZnjg6eSvUUa7McjP9XwVVrrZzT"
              },
              {
                  "direction": "Right",
                  "hash": "CMdKYnS6ss31mi9rcnHparCPF6XRgWUKuR5NbGfZCnxG"
              },
              {
                  "direction": "Left",
                  "hash": "G6rzi2oW3iwv6qp6qZuyhwQyrbUJDr5oZd5TFn5BP6Vb"
              },
              {
                  "direction": "Right",
                  "hash": "Ra5Js6cttek6Ac1SG1eDZuqBKz9KRVCtQWFhq5zWtrM"
              }
          ]
      },
      {
          "block_hash": "2qEVDKL65Chz3Rm3qmxUT11GrSGPG6UTztZFkgME4XFZ",
          "id": "2acD27s4M9h8BSKMbh87c6WKibXcmrBk7HYcfPsnHxQw",
          "outcome": {
              "executor_id": "v1.dagro.near",
              "gas_burnt": 4524154091105,
              "logs": [
                  "{\"params\":{\"amount_delivered\":\"997000\",\"asset\":\"USDT\",\"confirmation_current\":\"0\",\"confirmation_owner_id\":\"0\",\"confirmation_signer_id\":\"0\",\"datetime\":\"2025-03-14 19:40:37\",\"exchange_rate\":\"1\",\"fee_deducted\":\"3000\",\"fiat_method\":\"4\",\"offer_id\":\"29\",\"operation_amount\":\"1000000\",\"order_id\":\"4\",\"owner_id\":\"9e733023724342ec6537b0ec9087ca377449085e636134b1d8be2cb635f2c65c\",\"payment_method\":\"2\",\"referente\":null,\"signer_id\":\"956eec3d0f70b088700bdc26c8048987cead33ab91bc104fd2234609d15a518b\",\"status\":\"1\",\"terms_conditions\":\"Hola gracias por el comercio, nos comunicaremos por medio del chat y allí coordinamos la entrega, gracias.\",\"time\":\"10\"},\"type\":\"accept_offer_sell\"}"
              ],
              "metadata": {
                  "gas_profile": [
                      {
                          "cost": "BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "15621318549"
                      },
                      {
                          "cost": "CONTRACT_LOADING_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "35445963"
                      },
                      {
                          "cost": "CONTRACT_LOADING_BYTES",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "1149786819235"
                      },
                      {
                          "cost": "LOG_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "3543313050"
                      },
                      {
                          "cost": "LOG_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "8816792388"
                      },
                      {
                          "cost": "READ_CACHED_TRIE_NODE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "212040000000"
                      },
                      {
                          "cost": "READ_MEMORY_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "49587400800"
                      },
                      {
                          "cost": "READ_MEMORY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "10252195101"
                      },
                      {
                          "cost": "READ_REGISTER_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "42791808162"
                      },
                      {
                          "cost": "READ_REGISTER_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "244138074"
                      },
                      {
                          "cost": "STORAGE_READ_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "338141074494"
                      },
                      {
                          "cost": "STORAGE_READ_KEY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "5911933803"
                      },
                      {
                          "cost": "STORAGE_READ_VALUE_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "5448284884"
                      },
                      {
                          "cost": "STORAGE_WRITE_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "385180416000"
                      },
                      {
                          "cost": "STORAGE_WRITE_EVICTED_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "40564158741"
                      },
                      {
                          "cost": "STORAGE_WRITE_KEY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "4440420621"
                      },
                      {
                          "cost": "STORAGE_WRITE_VALUE_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "55057906725"
                      },
                      {
                          "cost": "TOUCHING_TRIE_NODE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "515262589632"
                      },
                      {
                          "cost": "UTF8_DECODING_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "3111779061"
                      },
                      {
                          "cost": "UTF8_DECODING_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "194775759972"
                      },
                      {
                          "cost": "WASM_INSTRUCTION",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "473422852716"
                      },
                      {
                          "cost": "WRITE_MEMORY_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "50468307498"
                      },
                      {
                          "cost": "WRITE_MEMORY_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "6790363596"
                      },
                      {
                          "cost": "WRITE_REGISTER_BASE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "51579404748"
                      },
                      {
                          "cost": "WRITE_REGISTER_BYTE",
                          "cost_category": "WASM_HOST_COST",
                          "gas_used": "11887490628"
                      }
                  ],
                  "version": 3
              },
              "receipt_ids": [
                  "8j2oWs8dDvHvC72515fyNiYGv23Di7hooSFhKdHokNie"
              ],
              "status": {
                  "SuccessValue": ""
              },
              "tokens_burnt": "452415409110500000000"
          },
          "proof": [
              {
                  "direction": "Right",
                  "hash": "AND4VkHKyVwYdzEn6xuxaxZ8pgbWUTxjAQhC9wj3Zd34"
              },
              {
                  "direction": "Right",
                  "hash": "4QjSzK1tdu4NPsFddS2kQ5ZMWf9JmKahi7eVc29U7tf5"
              },
              {
                  "direction": "Left",
                  "hash": "CkLP2mYZQ15Pet9B76rTm4KyWZfEqvmrW24pw89dYqEH"
              },
              {
                  "direction": "Right",
                  "hash": "DKxniA5ML4zH6EDJULW4dPskmKD5cC3iLafvYE5RFyNt"
              },
              {
                  "direction": "Right",
                  "hash": "CrfErLWyJpHTBE86VPK437gesXtMS4Cboi1V6C17eUMj"
              },
              {
                  "direction": "Right",
                  "hash": "wzmXyXkZaV1jsy9hNoSJYgvADbnzwXdkhtECkKMqbUT"
              },
              {
                  "direction": "Right",
                  "hash": "9KnRaTSXruCu7zFDgebTtDH4BRbGoqSvwy8Y57c67Hyf"
              }
          ]
      },
      {
          "block_hash": "E6CFPg24B2bQ1aiCeD5KsXq4RQEDC7uPZZ8B5zULa1Ev",
          "id": "j5nL5fST6BdAHgnb2GeZvNdv6VjWoRuYpwoprCpm6Ty",
          "outcome": {
              "executor_id": "956eec3d0f70b088700bdc26c8048987cead33ab91bc104fd2234609d15a518b",
              "gas_burnt": 4174947687500,
              "logs": [],
              "metadata": {
                  "gas_profile": [],
                  "version": 3
              },
              "receipt_ids": [],
              "status": {
                  "SuccessValue": ""
              },
              "tokens_burnt": "0"
          },
          "proof": [
              {
                  "direction": "Left",
                  "hash": "3rKFSUVHdyeUYxKxUrEtNrvDnrBENTSJvQdJmv4s9LW4"
              },
              {
                  "direction": "Right",
                  "hash": "HMqQGNr8YGScaNr1UeUj33jbxUfCEQMWGqWBmoqXPPBE"
              },
              {
                  "direction": "Left",
                  "hash": "NQjAGH6ToZYU946YCUEBNfNQpM3H5sTVrjZXuJYSEqL"
              },
              {
                  "direction": "Right",
                  "hash": "5sGy2NGfn76JC2pFwWWG3jFiiq6aKQ2HRgmUXk7B8VkH"
              },
              {
                  "direction": "Left",
                  "hash": "EMUQscukamDd9CijNN32qkyHqps7FkYskPfqmcmGQwFR"
              },
              {
                  "direction": "Left",
                  "hash": "4zXCMPN3Tih15rzFqMMAKTFLm6rjJ5Pi52u8rG6FQX1"
              }
          ]
      }
  ],
  "status": {
      "SuccessValue": ""
  },
  "transaction": {
      "actions": [
          {
              "FunctionCall": {
                  "args": "eyJvZmZlcl90eXBlIjoxLCJvZmZlcl9pZCI6MjksImFtb3VudCI6IjEwMDAwMDAiLCJwYXltZW50X21ldGhvZCI6MiwiZGF0ZXRpbWUiOiIyMDI1LTAzLTE0IDE5OjQwOjM3IiwicmF0ZSI6MSwiYXNzb3NpYXRlZCI6ImFyZXBhV2FsbGV0In0=",
                  "deposit": "1",
                  "gas": 120000000000000,
                  "method_name": "accept_offer"
              }
          }
      ],
      "hash": "9wTdvynYs6YjaxgT5xZTvEhAC7qKH4DRp93xhiFuyWqL",
      "nonce": 131404083000423,
      "priority_fee": 0,
      "public_key": "ed25519:B4KrAXSY5WX9mpBxB1ceuhra1BiVaWtYeKc5RiWY23Wz",
      "receiver_id": "v1.dagro.near",
      "signature": "ed25519:2HtqGi7NagZiyuWDrr5AgqBsEQwBW6kXJN5MWWVbVHYdtjTHuLTENVyxsyzEgUNXvPVK6caQDvp8rLSBcTVkQfua",
      "signer_id": "956eec3d0f70b088700bdc26c8048987cead33ab91bc104fd2234609d15a518b"
  },
  "transaction_outcome": {
      "block_hash": "BKHDguofiigodHfKh14xBpL1dWq3bnd4gEXpvqrLNcfd",
      "id": "9wTdvynYs6YjaxgT5xZTvEhAC7qKH4DRp93xhiFuyWqL",
      "outcome": {
          "executor_id": "956eec3d0f70b088700bdc26c8048987cead33ab91bc104fd2234609d15a518b",
          "gas_burnt": 315164373535,
          "logs": [],
          "metadata": {
              "gas_profile": null,
              "version": 1
          },
          "receipt_ids": [
              "xcjRAcHJkZMZUEcaNX2Qt8cxmm3WNxCMsDgz7iBmKmG"
          ],
          "status": {
              "SuccessReceiptId": "xcjRAcHJkZMZUEcaNX2Qt8cxmm3WNxCMsDgz7iBmKmG"
          },
          "tokens_burnt": "31516437353500000000"
      },
      "proof": [
          {
              "direction": "Left",
              "hash": "B9Rzh4zkBZSm6bTUvfqXVeBRZ3RS21zsyNpY96nkibYb"
          },
          {
              "direction": "Right",
              "hash": "7os9HoUjoRrZddf2mkMxtAjAH77YbKkEwYbKndfpMSjw"
          },
          {
              "direction": "Left",
              "hash": "TkVwa5WfCD57BPFyzCMTH6g9Z9E2WejPMBsAD6PW9CY"
          },
          {
              "direction": "Right",
              "hash": "FbpFogShywyDDGRQbLJTGvtb1S6KGcXFnATJT38zgerQ"
          },
          {
              "direction": "Right",
              "hash": "ES3raYKswbSRArwksmhrQQk3LGe8U8ZXLkSXPP8HtVuv"
          },
          {
              "direction": "Right",
              "hash": "3p2bBCsmgHbNyVAJLVbo5mHiAP4APxGyaJrfeGgRHRKn"
          },
          {
              "direction": "Right",
              "hash": "6EG6scevk6J1enbRo13sNkDmwtYQPdg2vcnLxSWHwHWR"
          }
      ]
  }
}





function validJson(data: string) {
  try {
    JSON.parse(data)?.params
    return JSON.parse(data)?.params ? true : false;
  } catch {
    return false
  }
}

const dataOrder: any = aa.receipts_outcome.find((item: any) => item?.outcome?.logs.length > 0 && validJson(item?.outcome?.logs[0]) )

console.log( dataOrder?.outcome?.logs[0])


}

algo()