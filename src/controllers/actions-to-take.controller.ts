import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  interfaces,
  httpGet,
  httpPut,
  httpPost
} from 'inversify-express-utils';
import * as jwt_decode from 'jwt-decode';

import { ApiTypes } from '../apiTypes';
import { ConstantValues } from '../constantValues';
import { ActionsToTakeService } from '../services';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { ClientWayOfEntryModelInterface } from '../interfaces/models';

@controller(ConstantValues.actionstotake)
export class ActionsToTakeController implements interfaces.Controller {
  private dataSrv: ActionsToTakeService;

  public constructor(
    @inject(ApiTypes.actionsToTakeService)
    dataSrv: ActionsToTakeService
  ) {
    this.dataSrv = dataSrv;
  }

  @httpPut('/activate')
  public async Activate(req: Request, res: Response): Promise<void> {
    try {
      const modificationUser = (jwt_decode(req.headers['authorization']) as any)
        .user;
      if (!modificationUser) {
        res.status(403).send('unauthorized');
        return;
      }
      let serviceResult: ServiceResultInterface = await this.dataSrv.Activate(
        req.body.id,
        modificationUser
      );
      if (!serviceResult) {
        res.status(200).send({
          code: 'requestNotProcessed',
          detail: 'Any data was saved'
        });
      } else {
        let statusCode: number = 500;
        if (serviceResult.code !== 'error') {
          statusCode = 200;
        }
        res.status(statusCode).send(serviceResult);
      }
    } catch (ex) {
      res.status(500).send({
        code: 'error',
        detail: ex.detail || ex.message || ex
      });
    }
  }

  @httpPut('/inactivate')
  public async Inactivate(req: Request, res: Response): Promise<void> {
    try {
      const modificationUser = (jwt_decode(req.headers['authorization']) as any)
        .user;
      if (!modificationUser) {
        res.status(403).send('unauthorized');
        return;
      }
      let serviceResult: ServiceResultInterface = await this.dataSrv.Inactivate(
        req.body.id,
        modificationUser
      );
      if (!serviceResult) {
        res.status(200).send({
          code: 'requestNotProcessed',
          detail: 'Any data was saved'
        });
      } else {
        let statusCode: number = 500;
        if (serviceResult.code !== 'error') {
          statusCode = 200;
        }
        res.status(statusCode).send(serviceResult);
      }
    } catch (ex) {
      res.status(500).send({
        code: 'error',
        detail: ex.detail || ex.message || ex
      });
    }
  }

  @httpGet('/')
  public async GetAll(req: Request, res: Response): Promise<void> {
    try {
      let serviceResult = await this.dataSrv.GetAll();
      if (!serviceResult) {
        res.status(200).send({
          code: 'requestNotProcessed',
          detail: 'Any data was found'
        });
      } else {
        let statusCode: number = 500;
        if (serviceResult.code !== 'error') {
          statusCode = 200;
        }
        res.status(statusCode).send(serviceResult);
      }
    } catch (ex) {
      res.status(500).json(ex);
    }
  }

  @httpGet('/:id')
  public async GetById(req: Request, res: Response): Promise<void> {
    try {
      let serviceResult = await this.dataSrv.GetById(req.params.id);
      if (!serviceResult) {
        res.status(200).send({
          code: 'requestNotProcessed',
          detail: 'Any data was found'
        });
      } else {
        let statusCode: number = 500;
        if (serviceResult.code !== 'error') {
          statusCode = 200;
        }
        res.status(statusCode).send(serviceResult);
      }
    } catch (ex) {
      res.status(500).json(ex);
    }
  }

  @httpPost('/search')
  public async Search(req: Request, res: Response): Promise<void> {
    try {
      let serviceResult: ServiceResultInterface = await this.dataSrv.Search(
        req.body
      );
      if (!serviceResult) {
        res.status(200).send({
          code: 'requestNotProcessed',
          detail: 'Any data was found'
        });
      } else {
        let statusCode: number = 500;
        if (serviceResult.code !== 'error') {
          statusCode = 200;
        }
        res.status(statusCode).send(serviceResult);
      }
    } catch (ex) {
      res.status(500).json(ex);
    }
  }
}
