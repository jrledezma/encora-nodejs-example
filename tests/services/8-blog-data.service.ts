import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { ClientsUserAuthenticationServiceInterface, UsersInfoServiceInterface } from '../../src/interfaces/services';
import { UserInfoModelInterface, ClientUserModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { ClientInfoSchema, ClientInfoDocumentInterface, ClientUserDocumentInterface, ClientUserSchema } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import { BlogDataService } from '../../src/services/blog-data.service';
import { BlogDataModelInterface } from '../../src/interfaces/models/blog-data.model.interface';

describe('BlogDataClient User Authentication Unit Test',
  () => {

    let user: UserInfoModelInterface;
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();
      ApiContainer.get<UsersInfoServiceInterface>(ApiTypes.usersInfoService).GetAll()
        .then((serviceResult: ServiceResultInterface) => {
          if (serviceResult.code === 'success') {
            user = (serviceResult.detail as UserInfoModelInterface[])[0]
            done();
          }
        }).catch((reason: any) => {
          done(reason)
        });
    });

    describe('Create blogData', () => {

      it('Should create a blogData Object', (done) => {
        ApiContainer.get<BlogDataService>(ApiTypes.blogDataService).CreateRecord({
          title: 'test01',
          contents: 'test01',
          relatedImages: ['mo-000', 'mo-001', 'mo-002', 'mo-003'],
          showPostFrom: new Date(),
          showPostTo: new Date(),
          creationUser: user._id,
          isActive: true
        }, true)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let accessProfileInfo: BlogDataModelInterface = serviceResult.detail as BlogDataModelInterface;
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
    /*
        describe('Modify accessProfile', () => {
    
          before(async () => {
            let dbResult: UsersServiceInterface = await BlogDataSchema.findOne();
            if (!dbResult) {
              return false;
            }
            accessProfileInfo = dbResult;
            accessProfileInfo.name = 'Access profile Unit Test';
          });
    
          it('Should modify an accessProfile Object', (done) => {
            ApiContainer.get<AccessProfilesServiceInterface>(ApiTypes.accessProfilesService)
              .ModifyRecord(accessProfileInfo)
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
              .Search(null)
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
              .Search({ name: 'test01' })
              .then((serviceResult: ServiceResultInterface) => {
                if (serviceResult.code === 'success') {
                  let accessProfileInfoArray: AccessProfileModelInterface[] = serviceResult.detail as AccessProfileModelInterface[];
                  expect(accessProfileInfoArray.length).greaterThan(0);
                  done();
                } else {
                  return done(serviceResult);
                }
              }).catch((reason) => {
                return done(reason);
              });
          });
        });*/
  });

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  ClientUserSchema.remove({ email: 'userttest2@test.com' });
  ClientInfoSchema.remove({ alias: 'test01' })
  done();
});