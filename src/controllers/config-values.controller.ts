import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  interfaces,
  httpGet,
} from 'inversify-express-utils';
import * as jwt_decode from 'jwt-decode';

import { ApiTypes } from '../apiTypes';
import { ConstantValues } from '../constantValues';
import { ConfigValuesService } from '../services';
import { ServiceResultInterface } from '../interfaces/service-result.interface';

@controller(ConstantValues.configvalues)
export class ConfigValuesServiceController implements interfaces.Controller {
  private dataSrv: ConfigValuesService;

  public constructor(
    @inject(ApiTypes.configValuesService)
    dataSrv: ConfigValuesService
  ) {
    this.dataSrv = dataSrv;
  }

  @httpGet('/userstatus')
  public async UserStatus(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).send(this.dataSrv.UserStatus());
    } catch (ex) {
      res.status(500).send({
        code: 'error',
        detail: ex.detail || ex.message || ex
      });
    }
  }
}
