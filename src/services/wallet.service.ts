import GoogleAuthUtils from "../utils/google_auth.utils";
import walletUtils from "../utils/wallet.utils";
import encryp from "../utils/encryp";
import { configNear } from "../config/nearConfig";
import { Not, In } from "typeorm";
// const myContractWasm  = require("../services/code/metadao_dao.wasm");
import * as XLSX from "xlsx";
import { Response } from "express";
import axios from "axios";
import { Users } from "../entities";
import {
  loginInterface,
  perfilInterface,
  walletInterface,
} from "../interfaces/wallet.interface";
import ResponseUtils from "../utils/response.utils";

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

    return {
      wallet: walletData.address || "",
      email: user.email || "",
      name: user.name || "",
      image: user.image || "",
    };
  }

  static async putPerfil(
    seedPhrase: string,
    data: {
      email?: string;
      name?: string;
      image?: string;
      headingQuantity?: string;
      heading?: string;
      ladnName?: string;
      landAddress?: string;
    }
  ): Promise<perfilInterface> {
    const walletData: walletInterface = await walletUtils.parseFromSeedPhrase(
      seedPhrase
    );

    let user = await Users.findOne({ where: { wallet: walletData.address } });

    if (!user) throw ResponseUtils.error(400, "warning", "Usuario no registrado");

    user.email = data?.email || user.email;
    user.name = data?.name || user.name;
    user.image = data?.image || user.image;
    user.headingQuantity = data?.headingQuantity || user.headingQuantity;
    user.heading = data?.heading || user.heading;
    user.ladnName = data?.ladnName || user.ladnName;
    user.landAddress = data?.landAddress || user.landAddress;

    user.save();

    return {
      wallet: walletData.address || "",
      email: user.email || "",
      name: user.name || "",
      image: user.image || "",
      headingQuantity: user.headingQuantity || "",
      heading: user.heading || "",
      ladnName: user.ladnName || "",
      landAddress: user.landAddress || "",
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
}

async function releaseFounds(id: number) {
  let result = { data: {} };
  await axios
    .post("http://localhost:3003/encuesta/", {
      id: id,
    })
    .then((response: any) => {
      result = response;
    })
    .catch((error: any) => {
      throw new Error("Error al liberar el saldo : " + error);
    });

  return result;
}

async function algo() {
  await releaseFounds(1).catch((error) => {
    console.log("error aqui: ", error);
    throw new Error("Error aqui: " + error);
  });

  console.log(
    "fin-------------------------------------------------------------"
  );
}

// algo();

// WalletService.prototype.verifyWalletName("andresdom.near") // ("andresdom.near")

/* async function algo() {
 await delay(3000);

  const verifyEmail = await Wallet.find({ order: {id: 'ASC'} });

  verifyEmail.forEach(async (element) => {
    await delay(5000);
    // console.log(encryp.decryp(element.seedPhrase));
    // console.log("aqui: ", element.seedPhrase)
    const walletData = await walletUtils.parseFromSeedPhrase(encryp.decryp(element.seedPhrase));
    // const walletName = await walletUtils.getNearId(walletData.publicKey);
    console.log("seedPhrase: ", walletData.seedPhrase);
    console.log("address: ", walletData.address);
    // const accountIds = await walletUtils.listAccountsByPublicKey(walletData.publicKey);

    // console.log("accounts: ", accountIds, walletData.address);

  //  console.log(element.email, " ---------- ", walletName);
    Wallet.update({id: element.id}, {walletname: walletData.address});
   // await element.save();
  })
} */

// algo();
