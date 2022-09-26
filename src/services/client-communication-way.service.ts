import { injectable } from 'inversify';

import {
  ClientCommunicationWayDocumentInterface,
  ClientCommunicationWaySchema
} from '../models/index';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { ClientCommunicationWaysServiceInterface } from '../interfaces/services';
import { ClientCommunicationWayModelInterface } from '../interfaces/models';
import { CommonFunctions } from '../common';

@injectable()
export class ClientCommunicationWaysService
  implements ClientCommunicationWaysServiceInterface {
  //#region Public Properties

  public Activate = this.activate;
  public Inactivate = this.inactivate;
  public GetAll = this.getAll;
  public GetById = this.getById;
  public Search = this.search;

  //#endregion

  private dbDocument: ClientCommunicationWayDocumentInterface;
  private selectableFields = [
    '_id',
    'value',
    'description',
    'isActive',
    'lastModificationUser',
    'lastModificationDate'
  ];

  public constructor() { }

  private async activate(
    _id: string,
    modificationUserId: string
  ): Promise<ServiceResultInterface> {
    try {
      let dbResult: ClientCommunicationWayDocumentInterface = await ClientCommunicationWaySchema.findById(
        _id
      );
      if (!dbResult) {
        return {
          code: 'notDataFound',
          detail: 'Data not found for inactivation'
        };
      }
      dbResult.isActive = true;
      dbResult.lastModificationUser = modificationUserId;
      dbResult.lastModificationDate = new Date();
      dbResult.markModified('ClientCommunicationWaySchema');

      let updateResult = await dbResult.save();
      if (updateResult._id) {
        return {
          code: 'success',
          detail: 'Data inactivated successfully'
        };
      } else {
        return {
          code: 'notDataModified',
          detail: 'Data not inactivated'
        };
      }
    } catch (ex) {
      throw ex;
    }
  }

  private async inactivate(
    _id: string,
    modificationUserId: string
  ): Promise<ServiceResultInterface> {
    try {
      let dbResult: ClientCommunicationWayDocumentInterface = await ClientCommunicationWaySchema.findById(
        _id
      );
      if (!dbResult) {
        return {
          code: 'notDataFound',
          detail: 'Data not found for inactivation'
        };
      }
      dbResult.isActive = false;
      dbResult.lastModificationUser = modificationUserId;
      dbResult.lastModificationDate = new Date();
      dbResult.markModified('ClientCommunicationWaySchema');

      let updateResult = await dbResult.save();
      if (updateResult._id) {
        return {
          code: 'success',
          detail: 'Data inactivated successfully'
        };
      } else {
        return {
          code: 'notDataModified',
          detail: 'Data not inactivated'
        };
      }
    } catch (ex) {
      throw ex;
    }
  }

  private async getAll(): Promise<ServiceResultInterface> {
    try {
      let dbResult: ClientCommunicationWayDocumentInterface[] = await ClientCommunicationWaySchema.find()
        .select(this.selectableFields)
        .sort({ code: 'asc' });
      if (!dbResult) {
        return {
          code: 'notDataFound',
          detail: 'Data not found'
        };
      }
      return {
        code: 'success',
        detail: dbResult
      };
    } catch (ex) {
      throw ex;
    }
  }

  private async getById(id: string): Promise<ServiceResultInterface> {
    try {
      let dbResult: ClientCommunicationWayDocumentInterface = await ClientCommunicationWaySchema.findById(
        id
      );
      if (!dbResult) {
        return {
          code: 'notDataFound',
          detail: 'Data not found'
        };
      }
      return {
        code: 'success',
        detail: dbResult
      };
    } catch (ex) {
      throw ex;
    }
  }

  private async search(params: any): Promise<ServiceResultInterface> {
    try {
      let paramsResult: any = CommonFunctions.buildQueryParams(params);
      let dbResult: ClientCommunicationWayDocumentInterface[];
      if (Object.keys(paramsResult).length > 0) {
        dbResult = await ClientCommunicationWaySchema.find(paramsResult).select(
          this.selectableFields
        );
      } else {
        dbResult = await ClientCommunicationWaySchema.find().select(
          this.selectableFields
        );
      }
      if (!dbResult) {
        return {
          code: 'notDataFound',
          detail: 'Data not found'
        };
      }
      return {
        code: 'success',
        detail: dbResult
      };
    } catch (ex) {
      throw ex;
    }
  }
}
