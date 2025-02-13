const nodemailer = require("nodemailer");

 // TODO: replace `user` and `pass` values from <https://forwardemail.net>
 const network = process.env.NETWORK || "";
 const config = network == "testnet" ? {
  host: process.env.HOST_EMAIL,
  port: process.env.PORT_EMAIL,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL,
  }
} : {
  host: process.env.HOST_EMAIL,
  port: process.env.PORT_EMAIL,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL,
  },
  tls: {
    ciphers:'SSLv3'
  }
}

export const transporter = nodemailer.createTransport(config);

transporter.verify().then(() => {
  console.log("ready email")
});


/* export async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <hpalencia@dvconsultores.com>', // sender address
    to: "hrpmicarelli@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
} */

