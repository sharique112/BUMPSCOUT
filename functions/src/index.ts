/* 
* FILE NAME: index.ts
* FILE PATH: './'
* AUTHOR: NAYAN HATHIWALA
* CREATED ON: 10/8/2017
* DESCRIPTION: MAIN INDEX.
*/
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import { ApiBase } from './api'
import { makeUppercase } from './triggers'


// FIREBASE FUNCTION INITIALIZATION
admin.initializeApp(functions.config().firebase)



// admin.initializeApp({
//   credential: admin.credential.cert(__dirname+'/'+'secretkey.json'),
//   databaseURL: "https://bumpscout-c2d7d.firebaseio.com"
// });


/*
* CREATING EXPRESS APP
*/
const app = express()
// app.use(cors({ origin: true }))
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Importing  Base Api to Express app's root
app.use("/", ApiBase)

/*
* EXPORTING EXPRESS APP
*/

// app.listen(8080,()=>console.log("server started"))


export const api = functions.https.onRequest((req, res) => {
      if (!req.path) req.url = `/${req.url}`
      return app(req, res);
})

export { makeUppercase }



