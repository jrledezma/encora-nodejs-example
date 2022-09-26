import express = require('express');
import * as path from "path";
import * as session from 'express-session';
import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as Multer from 'multer';
import * as jwt_decode from 'jwt-decode';
import * as jwt from 'jsonwebtoken';

import { ApiContainer } from './apiConfig';
import { ConstantValues } from './constantValues';
//
import { DBGateway } from './common';
import './controllers';
import { PrintColorType } from './enums/print-color-type.enum';
import { ApiTypes } from './apiTypes';
import { UserServiceInterface } from './interfaces/services';

require('dotenv').config({ path: path.join(__dirname, '../.env') });

let server = new InversifyExpressServer(ApiContainer, null, {
  rootPath: ConstantValues.root
});
let multer = Multer({
  limits: { fieldSize: 25 * 1024 * 1024 }
});

server.setConfig((app): void => {
  app.use(allowCrossDomain);
  app.use(verifyAuthorizationCode);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: '250mb' }));
  app.use(multer.array('files'));
  app.use(cookieParser());
  app.use(
    session({
      key: 'usr_id',
      secret: '81u3$a7$3rvic3',
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 600000
      }
    })
  );
  mongoSetup();
});

function mongoSetup(): void {
  const connectionResult = DBGateway.connect();
}

function allowCrossDomain(req, res, next): void {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Origin, X-Requested-With, Accept'
  );
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
}

const verifyAuthorizationCode = async (req, res, next) => {
  try {
    if (!req.headers['authorization']) {
      return res.status(401).send({
        code: 'unauthorized',
        detail: 'not authorized'
      });
    }
    if (verifyToken(req.headers['authorization'])) {
      const sessionToken =
        (jwt_decode(req.headers['authorization']) as any).token ||
        (jwt_decode(req.headers['authorization']) as any).user;

      if (!sessionToken) {
        return res.status(401).send({
          code: 'unauthorized',
          detail: 'not authorized'
        });
      }
      if (sessionToken !== process.env.AUTH_CODE) {
        if (!(await verifyUserId(sessionToken))) {
          return res.status(403).send({
            code: 'forbidden',
            detail: 'the authorization code is not valid'
          });
        }
      }
      return next();
    }

    return res.status(403).send({
      code: 'forbidden',
      detail: 'the authorization code is not valid'
    });
  } catch (ex) {
    return res.status(403).send({
      code: 'forbidden',
      detail: 'the authorization code is not valid'
    });
  }
};

function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, process.env.AUTH_SECRET_KEY);
    return true;
  } catch (ex) {
    throw ex;
  }
}

const verifyUserId = async (userId: string) => {
  try {
    const result = await ApiContainer.get<UserServiceInterface>(
      ApiTypes.userService
    ).GetByID(userId);
    if (result.code !== 'success') {
      return false;
    }
    if (result.detail) {
      return true;
    }
  } catch (ex) {
    throw ex;
  }
};

export default server.build();
