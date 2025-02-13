const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();7


async function verifyAccesGoogle(token:string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID_GOOGLE,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
      payload: payload,
      userid: payload['sub'],
    }
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  } catch (error:any) {
    throw new Error ("Error token invalido")
  }
}


export default {
  verifyAccesGoogle
}