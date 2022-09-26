import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { UsersInfoServiceInterface } from '../../src/interfaces/services';
import { UserInfoModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { ClientInfoSchema, ClientInfoDocumentInterface, ClientUserDocumentInterface, ClientUserSchema } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import { BlogDataModelInterface } from '../../src/interfaces/models/blog-data.model.interface';
import { CustomerSiteInformationServiceInterface } from '../../src/interfaces/services/customer-site-information.service.interface';
import { CustomerSiteInformationModelInterface } from '../../src/interfaces/models/customer-site-information.model.interface';

describe('Customer Site Information Unit Test',
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

    describe('Create Customer Site Information', () => {

      it('Should create or modify the customer site information', (done) => {
        ApiContainer.get<CustomerSiteInformationServiceInterface>(ApiTypes.customerSiteInformationService)
          .ModifyRecord({
            carrouselImages: ['test01', 'test02'],
            services: 'test01',
            aboutUs: 'text',
            contactEmail: 'email@mail.com',
            phoneNumber: '33333333',
            facebookUrl: 'facebook.com/test',
            instagramUrl: 'instagram.com/test',
            creationUser: user._id,
          })
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let data: CustomerSiteInformationModelInterface = serviceResult.detail as CustomerSiteInformationModelInterface;
              expect(data._id).is.not.null
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

    describe('Get Customer Site Information', () => {
      it('Should get an customerSiteInformation', (done) => {
        ApiContainer.get<CustomerSiteInformationServiceInterface>(ApiTypes.customerSiteInformationService)
          .GetAll(null)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let data: CustomerSiteInformationModelInterface = serviceResult.detail as CustomerSiteInformationModelInterface;
              expect(data._id).not.null;
              done();
            } else {
              return done(serviceResult);
            }
          });
      });
    });
  });

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  ClientUserSchema.remove({ email: 'userttest2@test.com' });
  ClientInfoSchema.remove({ alias: 'test01' })
  done();
})