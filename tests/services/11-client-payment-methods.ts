import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { ClientsInfoServiceInterface } from '../../src/interfaces/services';
import { ClientInfoModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { ClientInfoSchema, ClientInfoDocumentInterface } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import { ClientPaymentMethodsServiceInterface } from '../../src/interfaces/services/client-payment-methods.server';
import { ClientPaymentMethodModelInterface } from '../../src/interfaces/models/client-payment-method.model.interface';
import ClientPaymentMethodsSchema, { ClientPaymentMethodDocumentInterface } from '../../src/models/client-payment-method.model';
import { assert } from 'console';

let clientInfo: ClientInfoDocumentInterface;
before((done: MochaDone) => {
  MongoTestingConfig.ConnectToDB();
  ClientInfoSchema.findOne()
    .then((dbResult: ClientInfoDocumentInterface) => {
      if (!dbResult) {
        return false;
      }
      clientInfo = dbResult;
      done();
    });
});

/*describe('Client Payment Methods Unit Test',
  () => {
    describe('Create Payment Method for Client', () => {

      it('Should create a payment object', (done) => {
        ApiContainer.get<ClientPaymentMethodsServiceInterface>(ApiTypes.clientPaymentMethodsService)
          .Create({
            client: clientInfo._id,
            last4Digits: 'xxxx',
            token: 'xxxx',
            cardHolder: 'xxxx xxxx',
            cardBrand: 'visa'
          } as ClientPaymentMethodModelInterface)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let clientId = serviceResult.detail;
              expect(clientId).is.not.null
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


describe('Get Client Payment Method', () => {

  let paymentMethod: ClientPaymentMethodDocumentInterface;
  before((done: MochaDone) => {
    ClientPaymentMethodsSchema.findOne({ client: clientInfo._id })
      .then((dbResult: ClientPaymentMethodDocumentInterface) => {
        if (!dbResult) {
          return false;
        }
        paymentMethod = dbResult;
        done();
      });
  });

  it('Should get a payment method token', (done) => {
    ApiContainer.get<ClientPaymentMethodsServiceInterface>(ApiTypes.clientPaymentMethodsService)
      .GetToken(paymentMethod._id)
      .then((serviceResult: ServiceResultInterface) => {
        if (serviceResult.code === 'success') {
          expect(serviceResult.detail).not.null;
          done();
        } else {
          return done(serviceResult);
        }
      });
  });

  it('Should get payment methods for client', (done) => {
    ApiContainer.get<ClientPaymentMethodsServiceInterface>(ApiTypes.clientPaymentMethodsService)
      .GetAll(clientInfo._id)
      .then((serviceResult: ServiceResultInterface) => {
        if (serviceResult.code === 'success') {
          expect(serviceResult.detail).not.null;
          done();
        } else {
          return done(serviceResult);
        }
      });
  });
});

describe('validate created payment method',
  () => {

    it('Should return an error', (done) => {
      ApiContainer.get<ClientPaymentMethodsServiceInterface>(ApiTypes.clientPaymentMethodsService)
        .Create({
          client: clientInfo._id,
          last4Digits: 'xxxx',
          token: 'xxxx'
        } as ClientPaymentMethodModelInterface)
        .then((serviceResult: ServiceResultInterface) => {
          if (serviceResult.code === 'recordAlreadyCreated') {
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
*/
describe('Set Payment Method as Default', () => {

  it('Should remove a client payment method', (done) => {
    ApiContainer.get<ClientPaymentMethodsServiceInterface>(ApiTypes.clientPaymentMethodsService)
      .SetAsDefault('5fa2bb3badfab000081ec96e', '5f7cd33da76e0b00074abc0d')
      //.SetAsDefault('5fa1ed18e9b0460007de8146', '5f7cd33da76e0b00074abc0d')
      .then((serviceResult: ServiceResultInterface) => {
        if (serviceResult.code === 'success') {
          done();
        } else {
          return done(serviceResult);
        }
      });
  });
});

/*describe('Remove Client Payment Method', () => {

  let paymentMethod: ClientPaymentMethodDocumentInterface;
  before((done: MochaDone) => {
    ClientPaymentMethodsSchema.findOne({ client: clientInfo._id })
      .then((dbResult: ClientPaymentMethodDocumentInterface) => {
        if (!dbResult) {
          return false;
        }
        paymentMethod = dbResult;
        done();
      });
  });

  it('Should remove a client payment method', (done) => {
    ApiContainer.get<ClientPaymentMethodsServiceInterface>(ApiTypes.clientPaymentMethodsService)
      .Delete(paymentMethod._id)
      .then((serviceResult: ServiceResultInterface) => {
        if (serviceResult.code === 'success') {
          done();
        } else {
          return done(serviceResult);
        }
      });
  });
});
*/

after((done: MochaDone) => {
  MongoTestingConfig.CloseDBConnection();
  done();
});