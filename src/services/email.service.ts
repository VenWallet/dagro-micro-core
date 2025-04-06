import path from 'path';
import { transporterEmail } from "../config/emailConfig";
import ResponseUtils from '../utils/response.utils';
const hbs = require('nodemailer-express-handlebars');


export default class EmailService {
  static async sendEmailCreateOrder(data: {
    email: string,
    orderId: string,
    type: string
  }): Promise<void> {
    const transporter = transporterEmail;

    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./src/handlebars/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./src/handlebars/'),
    };
    
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))
    
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: data.email,
        subject: 'Notificacion Dagro tiene una nueva orden',
        template: 'emailOrder', // the name of the template file i.e email.handlebars
        context:{
          order: data.orderId, // replace
          type: data.type.toLowerCase(), // replace
          headTitle: 'Info Dagro - Nueva Orden',
          p1: 'Tiene una nueva orden, en su cuenta DAGRO!',
          p2: 'Hola, estás recibiendo este correo porque tienes un nuevo número de pedido.',
          p3: '',
        }
     }
    
  
    return await transporter.sendMail(mailOptions, function(error: any, info: any){
        if (error) {
           console.log(error);
           throw ResponseUtils.error(500, "Error sendMail", error);
        } else {
           console.log('Email sent: ' + info.response);
           return info.response;
        }
    });
  }


  static async sendEmailReleaseOrder(data: {
    email: string,
    orderId: string,
    type: string
  }): Promise<void> {
    const transporter = transporterEmail;

    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./src/handlebars/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./src/handlebars/'),
    };
    
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))
    
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: data.email,
      subject: 'Notificacion Dagro liberar orden',
      template: 'emailOrder', // the name of the template file i.e email.handlebars
      context:{
        order: data.orderId, // replace
        type: data.type.toLowerCase(), // replace
        headTitle: 'Info Dagro - Orden Ejecutada',
        p1: 'Orden ejecutada exitosamente, por favor liberar!',
        p2: 'Hola, estás recibiendo este correo porque tu número de pedido',
        p3: 'Ha sido marcado como completado, por favor liberar.',
      }
    };
  
    return await transporter.sendMail(mailOptions, function(error: any, info: any){
        if (error) {
           console.log(error);
           throw ResponseUtils.error(500, "Error sendMail", error);
        } else {
           console.log('Email sent: ' + info.response);
           return info.response;
        }
    });
  }


  static async sendEmailCompletedOrder(data: {
    email: string,
    orderId: string,
    type: string
  }): Promise<void> {
    const transporter = transporterEmail;

    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./src/handlebars/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./src/handlebars/'),
    };
    
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))
    
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: data.email,
        subject: 'Notificacion Dagro Orden Culminada',
        template: 'emailOrder', // the name of the template file i.e email.handlebars
        context:{
          order: data.orderId, // replace
          type: data.type.toLowerCase(), // replace
          headTitle: 'Info Dagro - Orden Culminada',
          p1: 'Orden completada exitosamente!',
          p2: 'Hola, estás recibiendo este correo porque tu número de pedido',
          p3: 'ha sido completado.',
        }
     }
    
  
    return await transporter.sendMail(mailOptions, function(error: any, info: any){
        if (error) {
           console.log(error);
           throw ResponseUtils.error(500, "Error sendMail", error);
        } else {
           console.log('Email sent: ' + info.response);
           return info.response;
        }
    });
  }
}