import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { TokenServiceInterface } from '../interfaces/services';

@injectable()
export class TokenService implements TokenServiceInterface {
  //#region Public Properties

  public Generate = this.generate;

  public constructor() { }

  //#region Private Functions

  private async generate(payload: any, durationTimeIn_ms: number = null) {
    try {
      if (durationTimeIn_ms) {
        return jwt.sign(payload, process.env.AUTH_SECRET_KEY, {
          expiresIn: durationTimeIn_ms.toString()
        });
      }
      return jwt.sign(payload, process.env.AUTH_SECRET_KEY);
    } catch (ex) {
      return ex.message;
    }
  }
  //#endregion
}
