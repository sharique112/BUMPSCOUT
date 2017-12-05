/* 
* FILE NAME: index.ts
* FILE PATH: './api/'
* AUTHOR: NAYAN HATHIWALA
* CREATED ON: 10/8/2017
* DESCRIPTION: BASE API.
*/

/* 
* IMPORT LIBRARY HERE
*/
import * as functions from 'firebase-functions'
import { validateFireTokenId } from '../lib'
import * as express from 'express'
import { SubApi } from './sub-api/sub'
import { Authn } from './sub-api/authn'
import * as environment from '../environments/environment'


/* 
* Initiating Express Router
*/
const api = express.Router();

/*
* All API Base Functions goes below.
* -----------------------------------
* You can add as many sub-routes as you want, by just 
* defining express and initiating with express router
*/
api.get('/', function (req, res) {
  //console.log(functions.config().firebase);
  res.send("Hello from root route");
});


api.use('/sub', SubApi);
api.use('/authenticated', Authn);

export const ApiBase = api