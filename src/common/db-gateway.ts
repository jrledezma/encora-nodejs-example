import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import { CommonFunctions } from './common-functions';
import { PrintColorType } from '../enums/print-color-type.enum';
import { ServiceResultInterface } from '../interfaces/service-result.interface';

export class DBGateway {
  public static sessionStarted = mongoose.startSession;

  public static async testDBConnection() {
    try {
      CommonFunctions.PrintConsoleColor(
        ' • connecting to DB ...',
        PrintColorType.grey
      );
      const mongooseOptions: mongoose.ConnectionOptions = {
        useFindAndModify: true,
        autoReconnect: true,
        reconnectTries: 3,
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      mongoose
        .connect(process.env.MONGODB_URL, mongooseOptions)
        .then((value: any) => {
          CommonFunctions.PrintConsoleColor(
            ' • connected to DB ...',
            PrintColorType.success
          );
          mongoose.disconnect();
        })
        .catch((reason: any) => {
          CommonFunctions.PrintConsoleColor(
            ' ~ error connecting to DB ...',
            PrintColorType.error
          );
          CommonFunctions.PrintConsoleColor(`   -> ${reason}`, PrintColorType.grey);
        });
    } catch (ex) {
      CommonFunctions.PrintConsoleColor(
        ' ~ error connecting to DB ...',
        PrintColorType.error
      );
      CommonFunctions.PrintConsoleColor(`   -> ${ex}`, PrintColorType.grey);
    }
  }

  public static async connect(): Promise<void> {
    try {
      CommonFunctions.PrintConsoleColor(
        ' • connecting to DB ...',
        PrintColorType.grey
      );
      const mongooseOptions: mongoose.ConnectionOptions = {
        useFindAndModify: true,
        autoReconnect: true,
        reconnectTries: 1,
        poolSize: 5
      };
      mongoose
        .connect(process.env.MONGODB_URL, mongooseOptions)
        .then((value: any) => {
          CommonFunctions.PrintConsoleColor(
            ' • connected to DB ...',
            PrintColorType.success
          );
        })
        .catch((reason: any) => {
          CommonFunctions.PrintConsoleColor(
            ' ~ error connecting to DB ...',
            PrintColorType.error
          );
          CommonFunctions.PrintConsoleColor(`   -> ${reason}`, PrintColorType.grey);
        });
    } catch (ex) {
      CommonFunctions.PrintConsoleColor(
        ' ~ error connecting to DB ...',
        PrintColorType.error
      );
      CommonFunctions.PrintConsoleColor(`   -> ${ex}`, PrintColorType.grey);
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      mongoose.disconnect();
    } catch (ex) {
      CommonFunctions.PrintConsoleColor(
        ' ~ error disconnecting DB connection...',
        PrintColorType.error
      );
      CommonFunctions.PrintConsoleColor(`   -> ${ex}`, PrintColorType.grey);
    }
  }

  public static mapMongooseErrorObject(mongooseError: any) {
    try {
      let errorObj = {
        code: 'success',
        detail: {
          errors: []
        }
      };
      _.forEach(Object.keys(mongooseError), key => {
        if (key === 'errors') {
          _.forEach(Object.keys(mongooseError[key]), keyErrors => {
            errorObj.detail.errors.push(mongooseError[key][keyErrors].message);
          });
        }
      });
      return errorObj;
    } catch (ex) {
      return {
        code: 'error',
        detail: {
          technicalMessage: ex.message
        }
      };
    }
  }
}
