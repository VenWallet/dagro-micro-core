import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Users } from '../entities';
import encryp from '../utils/encryp';

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface CustomRequest extends Request {
  user?: Users;
  seedPhrase?: string;
}

const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Token ', '');
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const tokenJwt = token.split(".").slice(1).join(".");
    const decoded = jwt.verify(tokenJwt, JWT_SECRET);
    //const user: JwtPayload = decoded;
    if((typeof decoded) === 'object'){ 
      const user: any = decoded;
      const userData = await Users.findOne({where: { wallet: user.id, token: tokenJwt }});

      if (!userData) return res.status(401).send('Invalid token user');
      
      req.user = userData;
      req.seedPhrase = encryp.decrypAES(token.split(".")[0], userData.secret);
      next();
    } else {
      return res.status(401).send('Invalid token');
    }
  } catch (err: any) {
    console.log(err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token expired');
    }
    res.status(401).send('Invalid token');
  }
};

export default auth;