import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname}`;
const router = Router();

const cleanFileName = (fileName: string) => {
  const file = fileName.split(".").shift();
  return file;
};

readdirSync(PATH_ROUTER).filter((fileName) => {
  const cleanName = cleanFileName(fileName);
  if (cleanName !== "index") {
    import(`./${cleanName}`).then((moduleRouter) => {
      let ruta: string = `/${cleanName}${moduleRouter.router}`
      router.use(`/${cleanName}`, moduleRouter.router);
      console.log('Ruta Cargada ---->', cleanName, ` - ${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}${process.env.RUTA}/${cleanName}`)
    });
  }
});

export{router};