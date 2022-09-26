import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk';

import { ProductCatalogServiceInterface } from '../../src/interfaces/services';
import { ProductCatalogModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig';
import { ApiTypes } from '../../src/apiTypes';
import {
    ProductCatalogSchema,
    ProductCatalogDocumentInterface
} from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import { ConnectionStates } from 'mongoose';

describe('Prouduct Unit Test', () => {
    let productInfo: ProductCatalogDocumentInterface;
    before((done: MochaDone) => {
        MongoTestingConfig.ConnectToDB();
        done();
    });

    describe('Create Product', () => {
        it('Should create a product Object', done => {
            ApiContainer.get<ProductCatalogServiceInterface>(
                ApiTypes.productCatalogService
            )
                .CreateRecord(
                    {
                        _id: 'test01',
                        description: 'test000',
                        currency: '000000',
                        brutPrice: 1
                    } as ProductCatalogModelInterface,
                    true
                )
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let productInfo: ProductCatalogModelInterface = serviceResult.detail as ProductCatalogModelInterface;
                        expect(productInfo._id).is.not.null;
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

    describe('Modify product', () => {
        before(async () => {
            let dbResult: ProductCatalogDocumentInterface = await ProductCatalogSchema.findById(
                'test01'
            );
            if (!dbResult) {
                return false;
            }
            productInfo = dbResult;
            productInfo.description = 'Product Unit Test';
        });

        it('Should modify an productInfo Object', done => {
            console.log(productInfo, 'blah blah');
            ApiContainer.get<ProductCatalogServiceInterface>(
                ApiTypes.productCatalogService
            )
                .ModifyRecord(productInfo)
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

    describe('Get product', () => {
        it('Should get an productInfo array', done => {
            ApiContainer.get<ProductCatalogServiceInterface>(
                ApiTypes.productCatalogService
            )
                .GetAll()
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let productInfoArray: ProductCatalogModelInterface[] = serviceResult.detail as ProductCatalogModelInterface[];
                        expect(productInfoArray.length).greaterThan(0);
                        done();
                    } else {
                        return done(serviceResult);
                    }
                });
        });

        it('Should search productInfo object', done => {
            ApiContainer.get<ProductCatalogServiceInterface>(
                ApiTypes.productCatalogService
            )
                .Search({ description: 'Product Unit Test' }, ['_id'])
                .then((serviceResult: ServiceResultInterface) => {
                    if (serviceResult.code === 'success') {
                        let productInfoArray: ProductCatalogModelInterface[] = serviceResult.detail as ProductCatalogModelInterface[];
                        expect(productInfoArray.length).greaterThan(0);
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
