import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { AccessProfilesServiceInterface } from '../../src/interfaces/services';
import { AccessProfileModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { AccessProfileSchema, AccessProfileDocumentInterface } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';

describe('AccessProfiles Unit Test',
  () => {

    let accessProfileInfo: AccessProfileDocumentInterface;
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();
      done();
    });

    describe('Create accessProfile', () => {

      it('Should create an accessProfile Object', (done) => {
        ApiContainer.get<AccessProfilesServiceInterface>(ApiTypes.accessProfilesService).CreateRecord({
          referenceCode: 'test01',
          name: 'test01',
          description: 'descr test01',
          menuOptions: ['mo-000', 'mo-001', 'mo-002', 'mo-003'],
          isActive: true
        }, null)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let accessProfileInfo: AccessProfileModelInterface = serviceResult.detail as AccessProfileModelInterface;
              expect(accessProfileInfo._id).is.not.null
              done();
            } else {
              return done(serviceResult);
            }
          })
          .catch((reason: any) => {
            throw done(reason);
          });
      });
    })

    describe('Modify accessProfile', () => {

      before(async () => {
        let dbResult: AccessProfileDocumentInterface = await AccessProfileSchema.findOne();
        if (!dbResult) {
          return false;
        }
        accessProfileInfo = dbResult;
        accessProfileInfo.name = 'Access profile Unit Test';
      });

      it('Should modify an accessProfile Object', (done) => {
        ApiContainer.get<AccessProfilesServiceInterface>(ApiTypes.accessProfilesService)
          .ModifyRecord(accessProfileInfo, true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let _id = serviceResult.detail;
              expect(_id).is.not.null
              done();
            } else {
              return done(serviceResult);
            }
          })
          .catch((reason: any) => {
            throw done(reason);
          });
      });
    });

    describe('Get Access profile', () => {
      it('Should get an accessProfileInfo array', (done) => {
        ApiContainer.get<AccessProfilesServiceInterface>(ApiTypes.accessProfilesService)
          .Search(null, [''], true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let accessProfileInfoArray: AccessProfileModelInterface[] = serviceResult.detail as AccessProfileModelInterface[];
              expect(accessProfileInfoArray.length).greaterThan(0);
              done();
            } else {
              return done(serviceResult);
            }
          });
      });

      it('Should search accessProfileInfo object', (done) => {
        ApiContainer.get<AccessProfilesServiceInterface>(ApiTypes.accessProfilesService)
          .Search({ referenceCode: 'test01' }, ['_id'], true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let accessProfileInfoArray: AccessProfileModelInterface[] = serviceResult.detail as AccessProfileModelInterface[];
              expect(accessProfileInfoArray.length).greaterThan(0);
              done();
            } else {
              return done(serviceResult);
            }
          }).catch((reason) => {
            console.log(reason);
            return done(reason);
          });
      });
    });
  });

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  done();
});