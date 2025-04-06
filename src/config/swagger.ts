import path from "path";
import swaggerJSDoc, { OAS3Definition, OAS3Options } from "swagger-jsdoc";

const PATH_ROUTER = `${__dirname}`;

const cleanFileName = (fileName: string) => {
  let file;
  if (fileName.includes(".ts")) {
    file = fileName.split(".ts").shift();
  } else {
    file = fileName.split(".js").shift();
  }
  return file;
};

const cleanName = cleanFileName(__filename);

const swaggerDefinition: OAS3Definition = {
  openapi: "3.0.3",
  info: {
    title: "dagro - micro service V1",
    description: "micro service",
    contact: {
      email: "ejemplo@gmail.com",
    },
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://app.venwallet.xyz/testnet/dagro",//`${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}${process.env.RUTA}`,
    },
  ],
  tags: [
    {
      name: "wallet",
      description:
        "...",
    },
    {
      name: "p2p",
      description:
        "...",
    },
    {
      name: "image",
      description:
        "...",
    },
  ],
  components: {
    securitySchemes: {
      tokenAuth: {
        type: "apiKey", // Usa apiKey para esquemas personalizados
        in: "header", // El token se enviará en el encabezado
        name: "Authorization", // Nombre del encabezado donde se enviará el token
        description: "Usa el formato 'Token <tu-token>' para autenticar",
      },
    },
  },
  security: [
    {
      tokenAuth: [],
    },
  ],
};

const swaggerOptions: OAS3Options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../routes/*")],
};

export default swaggerJSDoc(swaggerOptions);