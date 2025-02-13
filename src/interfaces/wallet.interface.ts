export interface walletInterface {
  seedPhrase: string;
  publicKey: string;
  secretKey: string;
  address: string;
  isExists: boolean;
}

export interface loginInterface {
  wallet: string;
  email: string;
  name: string;
  image: string;
}

export interface perfilInterface {
  wallet: string;
  email: string;
  name: string;
  image: string;
  headingQuantity: string;
  heading: string;
  ladnName: string;
  landAddress: string;
}