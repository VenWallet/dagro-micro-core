export interface walletInterface {
  seedPhrase: string;
  publicKey: string;
  secretKey: string;
  address: string;
  isExists: boolean;
}

export interface loginInterface {
  token: string;
  wallet: string;
  email: string;
  name: string;
  image: string;
}

export interface profileInterface {
  wallet: string;
  email: string;
  name: string;
  image: string;
  headingQuantity: string;
  heading: string;
  ladnName: string;
  landAddress: string;
}