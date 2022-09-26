import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk';

import { ClientsInfoServiceInterface } from '../../src/interfaces/services';
import { ClientInfoModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig';
import { ApiTypes } from '../../src/apiTypes';
import { ClientInfoSchema, ClientInfoDocumentInterface } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';

describe('Client Unit Test', () => {
    let clientInfo: ClientInfoDocumentInterface;
    before((done: MochaDone) => {
        MongoTestingConfig.ConnectToDB();
        done();
    });

    describe('Create client', () => {
        it('Should create an client Object', done => {
            ApiContainer.get<ClientsInfoServiceInterface>(
                ApiTypes.clientsInfoService
            )
                .CreateRecord(
                    {
                        _id: 'test01',
                        idNumberType: 'test000',
                        idNumber: '000000',
                        commercialName: 'test01',
                        name: 'test01',
                        firstName: 'test',
                        lastName: 'test01',
                        email: 'test01',
                        phoneNumber1: '00000000',
                        phoneNumber2: '00000000',
                        clientType: 'test0001',
                        industry: 'otros',
                        isActive: true,
                        contacts: [
                            {
                                name: '',
                                firstName: 'Jose',
                                lastName: 'Ledezma',
                                erpCode: 'ct0000000',
                                idNumberType: 'fisica',
                                idNumber: '000000000000',
                                mobilePhone: '00000000',
                                otherPhone: '',
                                email: 'jose.ledezma@absquesoft.com',
                                charge: 'test'
                            }
                        ]
                    } as ClientInfoModelInterface,
                    true
                )
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let clientInfo: ClientInfoModelInterface = serviceResult.detail as ClientInfoModelInterface;
                        expect(clientInfo._id).is.not.null;
                        done();
                    } else {
                        return done(serviceResult);
                    }
                })
                .catch((reason: any) => {
                    done(reason);
                });
        });
    });

    describe('Modify client', () => {
        before(async () => {
            let dbResult: ClientInfoDocumentInterface = await ClientInfoSchema.findById(
                'test01'
            );
            if (!dbResult) {
                return false;
            }
            clientInfo = dbResult;
            clientInfo.name = 'Client Unit Test';
            clientInfo.contacts = [
                {
                    name: '',
                    firstName: 'Jose',
                    lastName: 'Ledezma Cortes',
                    erpCode: 'ct0000000',
                    idNumberType: 'fisica',
                    idNumber: '000000000000',
                    mobilePhone: '00000000',
                    otherPhone: '00000001',
                    email: 'jose.ledezma@absquesoft.com',
                    charge: 'test'
                },
                {
                    name: '',
                    firstName: 'Mohamed',
                    lastName: 'Ali Simpson',
                    erpCode: 'ct0000001',
                    idNumberType: 'fisica',
                    idNumber: '000000000001',
                    mobilePhone: '00000002',
                    otherPhone: '00000003',
                    email: 'mohamed.alid@absquesoft.com',
                    charge: 'test1'
                }
            ];
        });

        it('Should modify an clientInfo Object', done => {
            ApiContainer.get<ClientsInfoServiceInterface>(
                ApiTypes.clientsInfoService
            )
                .ModifyRecord(clientInfo)
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
                    done(reason);
                });
        });
    });

    describe('Get client', () => {
        it('Should get an clientInfo array', done => {
            ApiContainer.get<ClientsInfoServiceInterface>(
                ApiTypes.clientsInfoService
            )
                .GetAll()
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let clientInfoArray: ClientInfoModelInterface[] = serviceResult.detail as ClientInfoModelInterface[];
                        expect(clientInfoArray.length).greaterThan(0);
                        done();
                    } else {
                        return done(serviceResult);
                    }
                });
        });

        it('Should search clientInfo object', done => {
            ApiContainer.get<ClientsInfoServiceInterface>(
                ApiTypes.clientsInfoService
            )
                .Search({ name: 'Client Unit Test' }, ['_id'])
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
