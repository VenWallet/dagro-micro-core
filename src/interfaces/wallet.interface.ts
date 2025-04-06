import { Headings } from "../entities";

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
  phoneNumber: string;
  image: string;
  headingQuantity: string;
  heading: number | null;
  ladnName: string;
  landAddress: string;
}

export interface functionCallInterface {
  contractId: string;
  methodName: string;
  args: any;
  gas: string | undefined;
  attachedDeposit: string | undefined;
};