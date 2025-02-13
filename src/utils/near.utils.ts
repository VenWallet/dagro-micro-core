const nearAPI = require("near-api-js");
const { utils, AccountService, NearUtils, KeyPair, keyStores, Near, connect } = nearAPI;



async function isAddress(address: string): Promise<boolean> {
  const keyStore = new keyStores.InMemoryKeyStore();
  const near = new Near(NearUtils.ConfigNEAR(keyStore));
  const account = new AccountService(near.connection, address);
  const is_address = await account
    .state()
    .then((response: any) => {
      console.log(response);
      return true;
    })
    .catch((error: any) => {
      console.log(error);
      return false;
    });
  return is_address;
}


export default {
  isAddress
}