import { Request, Response } from "express";


const uploadImg = async (req: Request, res: Response) => {
  try {
    const files: any = req.files;

    if (files.imgDao) {
        return res.send({ imgDao: files.imgDao });
    } else {
        res.status(400).send();
    }
  } catch (error) {
      console.log(error);
      res.status(500).send();
  }

}

export default { uploadImg };

