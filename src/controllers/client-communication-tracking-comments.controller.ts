import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  interfaces,
  httpGet,
  httpPost,
  httpPut
} from 'inversify-express-utils';
import * as jwt_decode from 'jwt-decode';

import { ApiTypes } from '../apiTypes';
import { ConstantValues } from '../constantValues';
import { ClientCommunicationTrackingCommentsService } from '../services';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import {
  ClientCommunicationTrackingCommentModelInterface
} from '../interfaces/models';

@controller(ConstantValues.clienttrackingcomments)
export class ClientCommunicationsTrackingCommentsController implements interfaces.Controller {
  private clientCommunicationsTrackingSrv: ClientCommunicationTrackingCommentsService;

  public constructor(
    @inject(ApiTypes.clientCommunicationTrackingCommentsService)
    clientCommunicationsTrackingSrv: ClientCommunicationTrackingCommentsService
  ) {
    this.clientCommunicationsTrackingSrv = clientCommunicationsTrackingSrv;
  }

  @httpPost('/')
  public async Create(req: Request, res: Response): Promise<void> {
    try {
      req.body.product = '';
      req.body.user = (jwt_decode(req.headers['authorization']) as any).user;
      await this.clientCommunicationsTrackingSrv
        .Create(req.body as ClientCommunicationTrackingCommentModelInterface)
        .then((serviceResult: ServiceResultInterface) => {
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
        })
        .catch((reason: any) => {
          res.status(500).send(reason);
        });
    } catch (ex) {
      res.status(500).json(ex);
    }
  }

  @httpPut('/activate')
  public async Activate(req: Request, res: Response): Promise<void> {
    try {
      let serviceResult: ServiceResultInterface = await this.clientCommunicationsTrackingSrv.Activate(
        req.body.id
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
      let serviceResult: ServiceResultInterface = await this.clientCommunicationsTrackingSrv.Inactivate(
        req.body.id
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

  @httpGet('/bytrackingid/:id')
  public async GetByCommunicationTracking(req: Request, res: Response): Promise<void> {
    try {
      let serviceResult = await this.clientCommunicationsTrackingSrv.GetByCommunicationTracking(req.params.id);
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

  @httpGet('/byuser/:id')
  public async GetByUser(req: Request, res: Response): Promise<void> {
    try {
      let serviceResult = await this.clientCommunicationsTrackingSrv.GetByUser(req.params.id);
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
      let serviceResult = await this.clientCommunicationsTrackingSrv.GetById(req.params.id);
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
