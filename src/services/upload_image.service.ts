import multer from 'multer';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import ResponseUtils from '../utils/response.utils';


// Configurar el cliente S3 de aws-sdk
const s3Client = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT_URL!,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});



export async function uploadImage(file: Express.Multer.File, dir: string): Promise<string> {
 try {
    // Leer el archivo desde el sistema de archivos
    const fileContent = fs.readFileSync(file.path);
    
    // Configurar los parámetros para la carga
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_STORAGE_BUCKET_NAME!,
      Key: `${dir}/${file.filename}${path.extname(file.originalname)}`,
      Body: fileContent,
      ACL: "public-read",
      ContentType: file.mimetype
    };

    // Subir el archivo a DigitalOcean Spaces
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    
    // Eliminar el archivo temporal
    fs.unlinkSync(file.path);
    
    if(!params?.Key) throw `Error uploading image`;

    const url = `https://${process.env.AWS_STORAGE_BUCKET_NAME}.nyc3.digitaloceanspaces.com/${params.Key}`;

    return url;
    
  } catch (error: any) {
    throw ResponseUtils.error(500, "Error", error);
  }
}


