import cors from 'cors';
import express from 'express';
import { Application } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router } from './routes/index';
import bodyParser from 'body-parser';
import swaggerUi, { serve } from "swagger-ui-express";
import swaggerSetup from "./config/swagger";
import AppDataSource from "./config/data.source";
import "reflect-metadata";
import * as http from "http";
import * as https from "https";
import allowedOriginsList from "./config/allowedOrigins";

const fs = require("fs");

//inicializando el resto de express
dotenv.config();

process.env.TZ = "UTC";

const app: Application = express();
AppDataSource.initialize().then(() => console.log("Conexion ORM P2p Ready"));

app.set('trust proxy', true);

//const app = express();
const port = Number(process.env.PORT);

//dependencias express
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//app.use(morgan("dev"));

if(process.env.NETWORK! === "mainnet"){
  const allowedOrigins = allowedOriginsList;
  app.use(cors({
    origin: function(origin, callback){
      // Allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  }));
} else {
  app.use(cors());
}
app.use(express.json());


// routes
app.use(process.env.RUTA!, router);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSetup));

// credenciales ssl
let server
if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync("/etc/letsencrypt/live/musicfeast.io/privkey.pem", "utf8");
  const certificate = fs.readFileSync("/etc/letsencrypt/live/musicfeast.io/cert.pem", "utf8");
  const ca = fs.readFileSync("/etc/letsencrypt/live/musicfeast.io/chain.pem", "utf8");

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };
  server = https.createServer(credentials, app);
  console.log("htpps");
} else {
  server = http.createServer(app);
  console.log("htpp");
}

server.listen(port, '0.0.0.0', () => {
  return console.log(`server is listening on ${port} - ${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}${process.env.RUTA}/`);
});