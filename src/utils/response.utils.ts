import { responseInterface } from "../interfaces/response.interface";


export default class ResponseUtils {
  static response(code: number, message: string, data: any, ): responseInterface {  
    return {
      code,
      message,
      data
    }
  }

  static error(code: number, message: string, error: any, ): responseInterface {
    let errorParse: string;  
    if (typeof error != 'string') {
      errorParse = JSON.stringify(error);
    } else {
      errorParse = error;
    }
      
    return {
      code,
      message,
      data: errorParse! || ""
    }
  }


  static responseError(error: any): responseInterface {
    if (error?.code) {
      return error;
    } else {
      return this.error(500, "Internal Server Error", error);
    }
  }
}