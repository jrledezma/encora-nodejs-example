import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { ClientInfoSchema, ClientUserSchema, ClientInfoDocumentInterface } from '../../src/models';
import { MongoTestingConfig } from './mongoConfig';
import AccessProfileSchema from '../../src/models/access-profile.model';
import UserSchema from '../../src/models/user.model';
import BlogDataSchema from '../../src/models/blog-data.model';
import CustomerSiteInformationSchema from '../../src/models/customer-site-information.model';
import ClientPaymentMethodsSchema from '../../src/models/client-payment-method.model';

describe('Remove data from tests',
    () => {
        before((done: MochaDone) => {
            MongoTestingConfig.ConnectToDB();
            done();
        });

        describe('Remove Access Profile data', () => {
            it('should remove the access profile test data', (done) => {
                AccessProfileSchema.remove({ referenceCode: 'test01' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            })
        });

        describe('Remove User data', () => {
            it('should remove the user test data', (done) => {
                UserSchema.remove({ email: 'test@test.test' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            })
        });

        describe('Remove Client User data', () => {
            it('should remove the client user test data', (done) => {
                ClientUserSchema.remove({ email: 'userttest@test.com' })
                    .then((result) => { console.log(result); })
                ClientUserSchema.remove({ email: 'userttest2@test.com' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            })
        });

        describe('Remove Client Billing data', () => {
            it('should remove the client billing test data', (done) => {
                ClientUserSchema.remove({ billNumber: '1234560987' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            })
        });

        describe('Remove Client Info data', () => {
            it('should remove the client info test data', (done) => {
                ClientInfoSchema.remove({ alias: 'test01' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            });
        });

        describe('Remove Blog Data data', () => {
            it('should remove the blogData test data', (done) => {
                BlogDataSchema.remove({ alias: 'test01' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            });
        });

        describe('Remove Customer Site Information data', () => {
            it('should remove the customerSiteInformation test data', (done) => {
                CustomerSiteInformationSchema.remove({ contactEmail: 'email@mail.com' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            });
        });

        describe('Remove Client Payment Method', () => {
            it('should remove the clientPaymentMethod test data', (done) => {
                ClientPaymentMethodsSchema.remove({ token: 'xxxx' })
                    .then((result) => {
                        done();
                    }).catch((reason) => {
                        done(reason);
                    })
            });
        });
    });

after((done: MochaDone) => {
    MongoTestingConfig.CloseDBConnection();
    done();
});
