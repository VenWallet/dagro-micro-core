import axios from "axios";
const nearAPI = require("near-api-js");
const { utils, AccountService, NearUtils, KeyPair, keyStores, Near, connect } = nearAPI;
import {configNear} from '../config/nearConfig';
import encryp from "./encryp";
import { accountsByPublicKey } from '@mintbase-js/data';
import { walletInterface } from "../interfaces/wallet.interface";

const nearSeedPhrase = require('near-seed-phrase');


/* async function emailRegistered(email: string) {
  const wallet = await Wallet.findOneBy({email: email.trim()});
  if(!wallet) throw new Error("Correo no registrado") /* {
    const dataWallet = await generateSeedPhrase()

    const createWallet = new Wallet();
    createWallet.email = email;
    createWallet.seedPhrase = encryp.encryp(dataWallet.seedPhrase);
    
    const save = await createWallet.save();

    if(!save) throw new Error ("Error al registrar su correo")
  
    return dataWallet
  } else { *
  
  //}
} */



async function generateSeedPhrase() {
  const {seedPhrase, publicKey, secretKey} = await nearSeedPhrase.generateSeedPhrase();
  const keyPair = KeyPair.fromString(secretKey);
  const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString("hex");

  const result: any = {
    seedPhrase: seedPhrase, 
    publicKey: publicKey, 
    secretKey: secretKey,
    address: implicitAccountId,
    isExists: false,
  };

  return result;
}

interface I_getAccountIdListFromPublicKey_Output {
  keys: {
      public_key: string;
      account_id: string;
      permission_kind: string;
  }[];
}

function listAccountsByPublicKey(publicKey: string): Promise<any[]> {
  return new Promise(async (masterResolve) => {
      const masterController = new AbortController();

      const INDEXER_SERVICE_URL = process.env.NETWORK == "testnet" ? 'https://api-testnet.nearblocks.io/v1/kitwallet' 
      : 'https://api3.nearblocks.io/v1/kitwallet';

      const INDEXER_SERVICE_URL_v1 = process.env.NETWORK == "testnet" ? 'https://api-testnet.nearblocks.io/v1' 
      : 'https://api.nearblocks.io/v1';

      const INDEXER_SERVICE_URL_v3 = process.env.NETWORK == "testnet" ? 'https://api-testnet.nearblocks.io/v1' 
      : 'https://api3.nearblocks.io/v1';

      const network = process.env.NETWORK == "testnet" ? 'testnet' : 'mainnet';
      // const IS_MAINNET =  // ["mainnet"].some((env:any) => env === process.env.NETWORK);

      const promises = [
          // ---------------------
          // Nearblocks API3 kitwallet mock
          // ---------------------
          fetch(`${INDEXER_SERVICE_URL}/publicKey/${publicKey}/accounts`, {
              headers: {
                    'X-requestor': 'near',
              },
              signal: masterController.signal,
          })
              .then((res) => res.json() )
              .catch((err) => {
                  console.warn('kitwallet fetch error', err);
                  return [];
              }),

          fetch(`${INDEXER_SERVICE_URL_v1}/keys/${publicKey}`, {
                headers: {
                      'X-requestor': 'near',
                },
                signal: masterController.signal,
            })
                .then(async (res) => {
                  
                  const result = (await res.json()) as I_getAccountIdListFromPublicKey_Output;
                  if (result.keys && result.keys instanceof Array && result.keys.length > 0) {
                    return result.keys.map((item) => item.account_id)
                  } else {
                    return [];
                  }

                })
                .catch((err) => {
                    console.warn('api v1 fetch error', err);
                    return [];
                }),
                
          fetch(`${INDEXER_SERVICE_URL_v3}/keys/${publicKey}`, {
                  headers: {
                        'X-requestor': 'near',
                  },
                  signal: masterController.signal,
              })
                  .then(async (res) => {
                    const result = (await res.json()) as I_getAccountIdListFromPublicKey_Output;
                    if (result.keys && result.keys instanceof Array && result.keys.length > 0) {
                      return result.keys.map((item) => item.account_id)
                    } else {
                      return [];
                    }
  
                  })
                  .catch((err) => {
                      console.warn('api v3 fetch error', err);
                      return [];
                  }),

            /* axios.get(`${CONFIG.INDEXER_SERVICE_URL}/publicKey/${publicKey}/accounts`)
            .then((response) => {
              response.json()
            }).catch((err) => {
              console.warn('kitwallet fetch error', err);
              return [];
            }), */
          
          // ---------------------
          // Mintbase API
          // ---------------------
          accountsByPublicKey(
              publicKey.toString(),
              network
          )
            .then((res) => res.data ?? [])
            .catch((err) => {
                console.warn('mintbase fetch error', err);
                return [];
            }),
          
           
      ];

      if (network == "mainnet") {
          // ---------------------
          // Fastnear API
          // ---------------------
          promises.push(
              fetch(
                  `https://api.fastnear.com/v0/public_key/${publicKey}/all`,
                  {
                      signal: masterController.signal,
                  }
              )
                  .then((res) => res.json())
                  .then((res) => res.account_ids ?? [])
                  .catch((err) => {
                      console.warn('fastnear fetch error', err);
                      return [];
                  })
          );
      }

      const results = await Promise.all(
          promises.map((promise) =>
              promise.then((data) => {
                  if (data.length === 0) {
                      return data;
                  }

                  masterController.abort();
                  masterResolve(data);
              })
          )
      );

      const flattenResults = results.flat();

      if (flattenResults.length === 0) {
          masterResolve([]);
      }
  });
}



async function parseFromSeedPhrase(seedPhrase: string): Promise<walletInterface> {
    const walletSeed = await nearSeedPhrase.parseSeedPhrase(seedPhrase);

    const keyPairNew = KeyPair.fromString(walletSeed.secretKey);
    const publicKey =  keyPairNew.publicKey.toString() // keyPairNew.getPublicKey().toString();
    let implicitAccountId = Buffer.from(keyPairNew.getPublicKey().data).toString("hex");
    //let address = Buffer.from().toString("hex");
    
    /* await axios.get(process.env.URL_API_INDEXER + "/publicKey/" + publicKey +'/accounts')
      .then((response) => {

        if(response.data.length > 0) {
          implicitAccountId = response.data[0].toString()
        }
    }).catch((error) => {
      console.log(error)
    }) */

    /* await axios.get(process.env.URL_API_INDEXER + "/keys/" + publicKey )
      .then((response) => {
        if(response.data?.keys?.length > 0) {
          if(response.data?.keys[0]?.account_id) {
            implicitAccountId = response.data?.keys[0]?.account_id
          }
        }
    }).catch((error) => {
      console.log(error)
    }) */

    /*const params = {
      "query":"\n  query mintbase_js_data__accountsByPublicKey(\n    $publicKey: String!\n  ) {\n    accounts: access_keys(\n  where: {\n  public_key: { _eq: $publicKey }\n removed_at: { _is_null: true }\n      }\n    ) {\n      id: account_id\n    }\n  }\n",
      "variables":{"publicKey": publicKey},
      "operationName":"mintbase_js_data__accountsByPublicKey"
    }
  
  
    await axios.post(`https://interop-${process.env.NETWORK}.hasura.app/v1/graphql`,  params)
      .then((response) => {
        if(response.data?.data?.accounts[0]) {
          implicitAccountId = response.data?.data?.accounts[0].id
        }
    }).catch((error) => {
      console.log(error)
    }) */

    const accountIds: any[] = await listAccountsByPublicKey(publicKey);
    
    if(accountIds.length > 0) {
      if(accountIds.length > 1) {
        for (let i = 0; i < accountIds.length; i++) {
          if(accountIds[i] === implicitAccountId) {
            continue;
          } else {
            implicitAccountId = accountIds[i]
            break;
          }
        }
      } else {
        implicitAccountId = accountIds[0]
      }

    }
    
    

    const result: walletInterface = {
      seedPhrase: seedPhrase, 
      publicKey: publicKey, 
      secretKey: walletSeed.secretKey,
      address: implicitAccountId,
      isExists: true,
    };

    return result;
}

async function nearConection(address: string, privateKey: string) {
    // creates a public / private key pair using the provided private key
    // adds the keyPair you created to keyStore
    const myKeyStore = new keyStores.InMemoryKeyStore();
    const keyPair = KeyPair.fromString(privateKey);
    await myKeyStore.setKey(process.env.NETWORK, address, keyPair);

    const nearConnection = await connect(configNear(myKeyStore));
    const account = await nearConnection.account(address);

    return account
}




export default {
  generateSeedPhrase,
  listAccountsByPublicKey,
  parseFromSeedPhrase,
  nearConection
}