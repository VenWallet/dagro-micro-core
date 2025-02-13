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
    title: "wallet - micro service V1",
    description: "micro service tron project wallet near",
    contact: {
      email: "ejemplo@gmail.com",
    },
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://localhost:3000/wallet-near/",
    },
    {
      url: "http://localhost:3000/wallet-near/",
    },
  ],
  tags: [
    {
      name: "wallet",
      description:
        "...",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
};

const swaggerOptions: OAS3Options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../routes/*")],
};

export default swaggerJSDoc(swaggerOptions);