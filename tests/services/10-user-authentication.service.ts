import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { UsersAuthenticationServiceInterface, UsersInfoServiceInterface } from '../../src/interfaces/services';
import { UserInfoModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { UserInfoDocumentInterface, UserInfoSchema } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';

describe('User Authentication Unit Test',
  () => {

    /*let userInfo: UserInfoModelInterface;
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();
      ApiContainer.get<UsersInfoServiceInterface>(ApiTypes.usersInfoService).Search({ email: 'test@test.test' }, true)
        .then((serviceResult: ServiceResultInterface) => {
          if (serviceResult.code === 'success') {
            userInfo = (serviceResult.detail as UserInfoModelInterface[])[0]
            done();
          }
        }).catch((reason: any) => {
          done(reason)
        });
    });

    describe('Change user password', () => {
      it('Should change user password', (done) => {
        ApiContainer.get<UsersAuthenticationServiceInterface>(ApiTypes.usersAuthenticationService).ModifyPassword(userInfo._id, '', 'newpassword', 'newpassword')
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              expect((serviceResult.detail as UserInfoModelInterface)._id).is.not.null
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

      it('Should verify if user credentials are correct', (done) => {
        ApiContainer.get<UsersAuthenticationServiceInterface>(ApiTypes.usersAuthenticationService)
          .VerifyCredentials('test@test.test', 'newpassword')
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let userInfo: UserInfoModelInterface = serviceResult.detail as UserInfoModelInterface;
              expect(userInfo._id).is.not.null
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
        ApiContainer.get<UsersAuthenticationServiceInterface>(ApiTypes.usersAuthenticationService)
          .CreateRecoveryPasswordToken(userInfo.email)
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
        ApiContainer.get<UsersAuthenticationServiceInterface>(ApiTypes.usersAuthenticationService)
          .VerifyRecoveryPasswordToken('test@test.test', token)
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
    });*/

    describe('verify registration token', () => {
      it('Should verify if registration token its valid', (done) => {
        ApiContainer.get<UsersAuthenticationServiceInterface>(ApiTypes.usersAuthenticationService)
          .VerifyRegistrationToken('$2a$10$D8Lmzm3xT6kxpSMCPacOCua82qu3dXNlcnR0ZXN0QHRlc3QuY29t')
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
    })
  });
       
after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  done();
});
