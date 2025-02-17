import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Users } from '../entities';

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface CustomRequest extends Request {
  user?: Users;
}

const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Token ', '');
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    //const user: JwtPayload = decoded;
    if((typeof decoded) === 'object'){ 
      const user: any = decoded;
      const userData = await Users.findOne({where: { wallet: user.id }});

      if (!userData) return res.status(401).send('Invalid token');
      
      req.user = userData;
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