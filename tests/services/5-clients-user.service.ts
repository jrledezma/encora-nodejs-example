import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { ClientsUserServiceInterface } from '../../src/interfaces/services';
import { ClientUserModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { ClientUserSchema, ClientUserDocumentInterface } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import { ClientsInfoService } from '../../src/services';
import { ClientInfoModelInterface } from '../../src/interfaces/models/client-info.model.interface';

describe('Client User Unit Test',
  () => {

    let clientInfo: ClientInfoModelInterface;
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();
      ApiContainer.get<ClientsInfoService>(ApiTypes.clientsInfoService).Search({ _id: 'test01' }, ['_id'])
        .then((serviceResult: ServiceResultInterface) => {
          if (serviceResult.code === 'success') {
            clientInfo = (serviceResult.detail as ClientInfoModelInterface[])[0]
            done();
          }
        });
    });

    describe('Create client user', () => {

      it('Should create an client user Object', (done) => {
        ApiContainer.get<ClientsUserServiceInterface>(ApiTypes.clientsUserService).CreateRecord({
          client: clientInfo._id,
          userName: '000000',
          email: 'userttest@test.com',
          isActive: true
        }, true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let clientUserInfo: ClientUserModelInterface = serviceResult.detail as ClientUserModelInterface;
              console.log(clientUserInfo);
              expect(clientUserInfo._id).is.not.null
              done();
            } else {
              done(serviceResult);
            }
          })
          .catch((reason: any) => {
            return done(reason);
          });
      });
    })
    /*
        describe('Modify client user', () => {
    
          let clientUser: ClientUserModelInterface;
          before(async () => {
            let dbResult: ClientUserDocumentInterface = await ClientUserSchema.findOne({ email: 'userttest@test.com' });
            if (!dbResult) {
              return false;
            }
            clientUser = dbResult;
            clientInfo.name = 'Client Unit Test';
          });
    
          it('Should modify an clientUser', (done) => {
            clientUser.email = 'userttest2@test.com'
            clientUser.client = (clientUser.client as any)._id;
            ApiContainer.get<ClientsUserServiceInterface>(ApiTypes.clientsUserService)
              .ModifyRecord(clientUser as ClientUserModelInterface, true)
              .then((serviceResult: ServiceResultInterface) => {
                if (serviceResult.code === 'success') {
                  let clientId = serviceResult.detail;
                  expect(clientId).is.not.null;
                  done();
                } else {
                  return done(serviceResult.detail);
                }
              })
              .catch((reason: any) => {
                throw done(reason);
              });
          });
        });
    
        describe('Get client user', () => {
          it('Should get an clientInfo array', (done) => {
            ApiContainer.get<ClientsUserServiceInterface>(ApiTypes.clientsUserService)
              .GetAll()
              .then((serviceResult: ServiceResultInterface) => {
                if (serviceResult.code === 'success') {
                  let clientUserArray: ClientUserModelInterface[] = serviceResult.detail as ClientUserModelInterface[];
                  expect(clientUserArray.length).greaterThan(0);
                  done();
                } else {
                  return done(serviceResult);
                }
              })
              .catch((reason: any) => {
                throw done(reason);
              });
          });
    
          it('Should search clientUser object', (done) => {
            ApiContainer.get<ClientsUserServiceInterface>(ApiTypes.clientsUserService)
              .Search({ email: 'userttest2@test.com' }, true)
              .then((serviceResult: ServiceResultInterface) => {
                if (serviceResult.code === 'success') {
                  let clientUserArray: ClientUserModelInterface[] = serviceResult.detail as ClientUserModelInterface[];
                  expect(clientUserArray.length).greaterThan(0);
                  done();
                } else {
                  return done(serviceResult);
                }
              })
              .catch((reason: any) => {
                throw done(reason);
              });
          });
        });*/
  });

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  done();
});
