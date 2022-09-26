import 'reflect-metadata';
import {expect} from 'chai';
import 'mocha';
import * as Chalk from 'chalk';

import {ClientsBillingInformationServiceInterface} from '../../src/interfaces/services';
import {
    ClientBillingInformationModelInterface,
    ClientInfoModelInterface,
} from '../../src/interfaces/models';
import {ServiceResultInterface} from '../../src/interfaces/service-result.interface';
import {ApiContainer} from '../../src/apiConfig';
import {ApiTypes} from '../../src/apiTypes';
import {
    ClientInfoSchema,
    ClientInfoDocumentInterface,
    ClientBillingInformationDocumentInterface,
    ClientBillingInformationSchema,
} from '../../src/models';
import {MongoTestingConfig} from './mongoConfig';
import {ClientsInfoService} from '../../src/services';

describe('Client Billing Unit Test', () => {
    let clientInfo: ClientInfoModelInterface;
    before((done: MochaDone) => {
        MongoTestingConfig.ConnectToDB();
        ApiContainer.get<ClientsInfoService>(ApiTypes.clientsInfoService)
            .Search({_id: 'test01'}, ['_id'])
            .then((serviceResult: ServiceResultInterface) => {
                if (serviceResult.code === 'success') {
                    clientInfo = (serviceResult.detail as ClientInfoModelInterface[])[0];
                    done();
                }
            });
    });

    describe('Create client billing', () => {
        it('Should create an clientBillingInformation Object', done => {
            ApiContainer.get<ClientsBillingInformationServiceInterface>(
                ApiTypes.clientsBillingInformationService,
            )
                .CreateRecord(
                    {
                        _id: 'bill-test-01',
                        client: clientInfo._id,
                        date: new Date(),
                        comments: 'esta es una prueba 2',
                        exchangeRate: 600,
                        discountAmount: 10,
                        taxesTotalAmount: 50,
                        subTotalAmmount: 100,
                        totalAmount: 1000,
                        billDetail: [
                            {
                                _id: 0,
                                billDate: new Date(),
                                productId: 'PROD-000',
                                productDescription: 'Prod TEST',
                                unitPrice: 30,
                                expr1: 1,
                                netPrice: 30,
                                taxes: 1.11,
                                totalPrice: 40,
                            },
                        ],
                    },
                    true,
                )
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let clientBillingInfo: ClientBillingInformationModelInterface = serviceResult.detail as ClientBillingInformationModelInterface;
                        expect(clientBillingInfo._id).is.not.null;
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

    describe('Modify client billing', () => {
        let billingInfo: ClientBillingInformationModelInterface;
        before(async () => {
            let dbResult: ClientBillingInformationDocumentInterface = await ClientBillingInformationSchema.findOne(
                {_id: 'bill-test-01'},
            );
            if (!dbResult) {
                return false;
            }
            billingInfo = dbResult;
            billingInfo.comments = 'Prueba de Actualizacion';
            billingInfo.billDetail.push({
                _id: 1,
                billDate: new Date(),
                productId: 'PROD-001',
                productDescription: 'Prod TEST nuevo',
                unitPrice: 35,
                expr1: 2,
                netPrice: 35,
                taxes: 1.33,
                totalPrice: 48,
            });
        });

        it('Should modify an clientInfo Object', done => {
            ApiContainer.get<ClientsBillingInformationServiceInterface>(
                ApiTypes.clientsBillingInformationService,
            )
                .ModifyRecord(billingInfo, true)
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let clientId = serviceResult.detail;
                        expect(clientId).is.not.null;
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

    describe('Get client billing', () => {
        it('Should get an clientBillingInfo array', done => {
            ApiContainer.get<ClientsBillingInformationServiceInterface>(
                ApiTypes.clientsBillingInformationService,
            )
                .GetAll()
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let billingInfoArray: ClientBillingInformationModelInterface[] = serviceResult.detail as ClientBillingInformationModelInterface[];
                        expect(billingInfoArray.length).greaterThan(0);
                        done();
                    } else {
                        return done(serviceResult);
                    }
                });
        });

        it('Should search clientBillingInfo object', done => {
            ApiContainer.get<ClientsBillingInformationServiceInterface>(
                ApiTypes.clientsBillingInformationService,
            )
                .Search({_id: 'bill-test-01'}, ['_id'], true)
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let clientInfoArray: ClientInfoModelInterface[] = serviceResult.detail as ClientInfoModelInterface[];
                        expect(clientInfoArray.length).greaterThan(0);
                        done();
                    } else {
                        return done(serviceResult);
                    }
                })
                .catch(reason => {
                    return done(reason);
                });
        });
    });
});

after((done: MochaDone) => {
    MongoTestingConfig.CloseDBConnection();
    done();
});
