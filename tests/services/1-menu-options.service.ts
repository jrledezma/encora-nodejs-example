import 'reflect-metadata';
import { expect } from 'chai';
import 'mocha';
import * as Chalk from 'chalk'

import { MenuOptionModelInterface } from '../../src/interfaces/models';
import { ServiceResultInterface } from '../../src/interfaces/service-result.interface';
import { ApiContainer } from '../../src/apiConfig'
import { ApiTypes } from '../../src/apiTypes'
import { MongoTestingConfig } from './mongoConfig';
import { MenuOptionService } from '../../src/services';
import MenuOptionSchema from '../../src/models/menu-option.model';
import { MenuOptionDocumentInterface } from '../../src/models/menu-option.model';
import { MenuOptionServiceInterface } from '../../src/interfaces/services/menu-option.service.interface';

describe('MenuOption Unit Test',
  () => {
    before((done: MochaDone) => {
      MongoTestingConfig.ConnectToDB();
      done();
    });

    describe('Get menuOptions', () => {

      it('Should get all menu options', (done) => {
        ApiContainer.get<MenuOptionService>(ApiTypes.menuOptionsService).Search({ code: 'MO-01' }, [])
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              expect(serviceResult.detail).is.not.null
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

    describe('get menuOption by ID', () => {

      let menuOption: MenuOptionModelInterface;
      before(async () => {
        let dbResult: MenuOptionDocumentInterface = await MenuOptionSchema.findOne();
        if (!dbResult) {
          return false;
        }
        menuOption = dbResult as MenuOptionModelInterface;
      });

      it('Should modify an clientInfo Object', (done) => {
        ApiContainer.get<MenuOptionServiceInterface>(ApiTypes.menuOptionsService)
          .GetByID(menuOption._id)
          .then((serviceResult: ServiceResultInterface) => {
            if (serviceResult.code === 'success') {
              let option = serviceResult.detail as MenuOptionModelInterface;
              expect(option).is.not.null
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
  done();
});