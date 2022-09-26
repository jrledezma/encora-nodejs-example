import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { ClientsUserAuthenticationServiceInterface, ClientsUserServiceInterface } from '../../src/interfaces/services';
import { ClientInfoModelInterface, ClientUserModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { ClientInfoSchema, ClientInfoDocumentInterface, ClientUserDocumentInterface, ClientUserSchema } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';

describe('Client User Authentication Unit Test',
  () => {

    let clientUser: ClientUserModelInterface;
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();
      ApiContainer.get<ClientsUserServiceInterface>(ApiTypes.clientsUserService).Search({ email: 'userttest2@test.com' }, true)
        .then((serviceResult: ServiceResultInterface) => {
          if (serviceResult.code === 'success') {
            clientUser = (serviceResult.detail as ClientUserModelInterface[])[0]
            done();
          }
        }).catch((reason: any) => {
          done(reason)
        });
    });

    describe('Change client user password', () => {

      it('Should verify if a client user credentials are correct', (done) => {
        ApiContainer.get<ClientsUserAuthenticationServiceInterface>(ApiTypes.clientsUserAuthenticationService).ModifyPassword(clientUser._id, '', 'newpassword', 'newpassword')
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              expect((serviceResult.detail as ClientInfoModelInterface)._id).is.not.null
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

    describe('Verify Credentials', () => {

      it('Should verify if a client user credentials are correct', (done) => {
        ApiContainer.get<ClientsUserAuthenticationServiceInterface>(ApiTypes.clientsUserAuthenticationService)
          .VerifyCredentials('userttest2@test.com', 'newpassword')
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let clientInfo: ClientInfoModelInterface = serviceResult.detail as ClientInfoModelInterface;
              expect(clientInfo._id).is.not.null
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

    let token;
    describe('Recovery Password Token', () => {

      it('Should create recovery password token', (done) => {
        ApiContainer.get<ClientsUserAuthenticationServiceInterface>(ApiTypes.clientsUserAuthenticationService)
          .CreateRecoveryPasswordToken(clientUser.email)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              token = serviceResult.detail;
              expect(serviceResult.detail).is.not.null;
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

    describe('verify recovery password token', () => {
      it('Should verify if recovery password token its valid', (done) => {
        ApiContainer.get<ClientsUserAuthenticationServiceInterface>(ApiTypes.clientsUserAuthenticationService)
          .VerifyRecoveryPasswordToken('userttest2@test.com', token)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              expect(serviceResult.detail).true
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
  });

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  ClientUserSchema.remove({ email: 'userttest2@test.com' });
  ClientInfoSchema.remove({ alias: 'test01' })
  done();
});