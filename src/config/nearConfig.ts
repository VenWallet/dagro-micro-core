// Cross-domain proxy prefix
// const API_PROXY_PREFIX='/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX


export function dataNear() {
	const network = process.env.NETWORK!;
	switch (network) {
		case 'mainnet':
			return {
				networkId: 'mainnet',
				keyStore: undefined,
				// nodeUrl: "https://rpc.mainnet.near.org",
				nodeUrl: 'https://free.rpc.fastnear.com',//'https://rpc.mainnet.pagoda.co',
				walletUrl: "https://app.mynearwallet.com/",
				helperUrl: 'https://helper.mainnet.near.org',
				explorerUrl: 'https://explorer.mainnet.near.org',
			};
		case 'testnet':
			return {
				networkId: 'testnet',
				keyStore: undefined,
				nodeUrl: 'https://rpc.testnet.near.org',
				walletUrl: "https://testnet.mynearwallet.com/",
				helperUrl: 'https://helper.testnet.near.org',
				explorerUrl: 'https://explorer.testnet.near.org',
			};
		default:
			throw new Error(`Unconfigured environment '${network}'`);
	}
}

export function configNear(keyStores:any) {
  const data = dataNear();
	data.keyStore = keyStores;

	return data;

  /*const network = process.env.NETWORK
  const enviroment = false
  const NETWORK = (enviroment) ? network : "mainnet";
  switch (NETWORK) {
    case "mainnet":
      return {
        networkId: "mainnet",
        keyStore: keyStores,
        // nodeUrl: "https://rpc.mainnet.near.org",
        nodeUrl: "https://rpc.mainnet.pagoda.co",
        walletUrl: "https://app.mynearwallet.com/",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
      };
    case "testnet":
      return {
        networkId: "testnet",
        keyStore: keyStores,
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
      };
    default:
      throw new Error(`Unconfigured environment '${NETWORK}'`);
  }*/
}

/* module.exports = {
  CONFIG,
}; */
