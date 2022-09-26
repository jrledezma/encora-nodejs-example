import * as express from 'express';
import { inject } from 'inversify';
import { controller, interfaces, httpPost } from 'inversify-express-utils';
import { ApiTypes } from '../apiTypes';
import { ConstantValues } from '../constantValues';
import { TokenService } from '../services';
import { ServiceResultInterface } from '../interfaces/service-result.interface';

@controller(ConstantValues.token)
export class TokenController implements interfaces.Controller {
  private tokenSrv: TokenService;

  public constructor(@inject(ApiTypes.tokenService) tokenSrv: TokenService) {
    this.tokenSrv = tokenSrv;
  }

  @httpPost('/')
  public async generate(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      let serviceResult: ServiceResultInterface = await this.tokenSrv.Generate(
        req.body,
        Number.parseInt(process.env.SESSION_TIMEOUT) * 1000
      );
      if (!serviceResult) {
        res.status(200).send({
          code: 'requestNotProcessed',
          detail: 'token not created'
        });
      } else {
        let statusCode: number = 500;
        if (serviceResult.code !== 'error') {
          statusCode = 200;
        }
        res.status(statusCode).send({
          code: 'success',
          detail: serviceResult
        });
      }
    } catch (ex) {
      res.status(500).json(ex);
    }
  }
}
