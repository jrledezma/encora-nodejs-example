import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { UsersInfoServiceInterface } from '../../src/interfaces/services';
import { UserInfoModelInterface, ClientInfoModelInterface, AccessProfileModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { UserInfoSchema, UserInfoDocumentInterface } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import { AccessProfilesService } from '../../src/services';

describe('User Unit Test',
  () => {

    let accessProfileInfo: AccessProfileModelInterface;
    let userInfo: UserInfoModelInterface;
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();

      ApiContainer.get<AccessProfilesService>(ApiTypes.accessProfilesService).Search(null, null, true)
        .then((serviceResult: ServiceResultInterface) => {
          if (serviceResult.code === 'success') {
            accessProfileInfo = (serviceResult.detail as AccessProfileModelInterface[])[0]
            done();
          }
        });
    });

    describe('Create user', () => {

      it('Should create an user Object', (done) => {
        ApiContainer.get<UsersInfoServiceInterface>(ApiTypes.usersInfoService).CreateRecord({
          firstName: 'test',
          lastName: 'user',
          email: 'test@test.test',
          accessProfile: accessProfileInfo._id,
          isActive: true
        }, null)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let accessProfileInfo: UserInfoModelInterface = serviceResult.detail as UserInfoModelInterface;
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

    describe('Modify user', () => {

      before(async () => {
        let dbResult: UserInfoDocumentInterface = await UserInfoSchema.findOne();
        if (!dbResult) {
          return false;
        }
        userInfo = dbResult;
        userInfo.firstName = 'first name modified';
        userInfo.lastName = 'last name modified';
      });

      it('Should modify an user Object', (done) => {
        ApiContainer.get<UsersInfoServiceInterface>(ApiTypes.usersInfoService)
          .ModifyRecord(userInfo, true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let userId = serviceResult.detail;
              expect(userId).is.not.null
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

    describe('Get user', () => {
      it('Should search user object', (done) => {
        ApiContainer.get<UsersInfoServiceInterface>(ApiTypes.usersInfoService)
          .Search({ email: 'test@test.test' }, true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let usersArray: UserInfoModelInterface[] = serviceResult.detail as UserInfoModelInterface[];
              expect(usersArray.length).greaterThan(0);
              done();
            } else {
              return done(serviceResult);
            }
          }).catch((reason) => {
            return done(reason);
          });
      });
    });
  });

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  done();
});