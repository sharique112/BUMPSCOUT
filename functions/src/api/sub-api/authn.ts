import { validateFireTokenId } from '../../lib'
import {MongoClient} from 'mongodb'
import * as MONGODB from 'mongodb'
import * as express from 'express'
import * as environment from '../../environments/environment'
import { connect } from 'http2';
import { ref } from 'firebase-functions/lib/providers/database';
import { Profile, Problem } from '../../models/index';



/* 
* Initiating Express Router
*/
const api = express.Router();
const mongo_uri :string = environment.default.MONGO;
const connectMongoDB = () => MongoClient.connect(mongo_uri)

/*
* All API Base Functions goes below.
* -----------------------------------
* You can add as many sub-routes as you want, by just 
* defining express and initiating with express router
*/

api.use(validateFireTokenId) // This make's sure that user is authenticated.

api.get('/', function (req, res) {
      res.send('Hello from APIv1 root route.');
});


api.get('/path/:name/:query', function (req, res) {
      res.json({
            name: req.params.name,
            query:req.params.query
      });
});

api.get('/get', function (req, res) {
      res.json({
            req: req.param['name']
      });
});

api.post('/post', function (req, res) {
      res.json({
            req: req.body.name
      });
});


api.post('/updateProfile',async function(req,res){
      try{
            let data  = req.body;
            if(data._id){
                  data.updatedAt = new Date().toISOString();
            }else{
                  data.createdAt= data.updatedAt = new Date().toISOString();
            }
            delete data['_id'];
            let db = await connectMongoDB();
            let query = {
                  "uid":data.uid
            }
            let collection = db.collection('profiles');
            let updatedProfile = await collection.update(query,data,{upsert:true});
            res.json({success:true,msg:"Profile info update successfully"});
            await db.close();
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }  
})

api.get('/profileslist/:uid',async function(req,res){
      try{
            let uid = req.params.uid;
            let db = await connectMongoDB();
            let collection = db.collection('profiles');
            let query = { uid: { $ne: uid } }
            let profiles = await collection.find(query).toArray();
            res.json({
                  success:true,
                  profiles:profiles.length ? profiles :[] 
            });
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }
})


api.get('/profile/:uid',async function(req,res){
      try{
            let uid = req.params.uid;
            let db = await connectMongoDB();
            let collection = db.collection('profiles');
            let query = { uid: uid  }
            let profile = await collection.findOne(query);
            res.json({
                  success:true,
                  profile:profile
            });
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }
})


api.post('/problem',async function(req,res){
      try{
            let data  = req.body;      
            let db = await connectMongoDB();
            let query = {
                  "_id": new MONGODB.ObjectId(data._id)
            }
            if(data._id){
                  data.updatedAt =  new Date().toISOString();
                  if(data.isFavourite && data.favourite.indexOf(data.uid)==-1){
                        data.favourite.push(data.uid);
                  }else if(!data.isFavourite) {
                        var index = data.favourite.indexOf(data.uid);
                        if(index > -1)data.favourite.splice(index, 1);
                  }
            }else{
                  data.createdAt = data.updatedAt = new Date().toISOString();
                  if(data.isFavourite){
                        data.favourite = [];
                        data.favourite.push(data.uid);
                  }else{
                        data.favourite = [];
                  }
            }
            delete data['_id'],delete data['isFavourite'];
            let collection = db.collection('problems');
            let problem = await collection.update(query,data,{upsert:true});
            res.json({success:true,msg:"Problem saved successfully"});
            await db.close();
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }  
})

api.put('/problem/updateFavourite', async function(req,res){
      try{
            let data = req.body      
            let db = await connectMongoDB();
            let query = {
                  "_id": new MONGODB.ObjectId(data._id)
            }
            let collection = db.collection('problems');
            console.log(data);
            if(data.isFavourite){
                  console.log()
                  let problem = await collection.update(query, { $addToSet: { favourite: data.uid } },{upsert:true});
                  res.json({success:true,msg:"Problem added to myBumps successfully"});
                  await db.close();
            }else if(!data.isFavourite){
                  let problem = await collection.update(query, { $pull: { favourite: data.uid } },{upsert:true});      
                  res.json({success:true,msg:"Problem removed from myBumps successfully"});
                  await db.close();
            } 
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }     
})


api.get('/problems/:uid/:query',async function(req,res){
      try{  
            let uid: any = req.params.uid;
            let query  = req.params.query;            
            let findQuery  = {};
            if(query == 'my') {
                  findQuery = {
                        "favourite": { $in: [uid] } 
                  }
            }else if(query=='all') findQuery = {}; 
            else findQuery = { "type":query };
            let db = await connectMongoDB();
            let collection = db.collection('problems');
            let problems = await collection.find(findQuery).toArray();
            res.json({
                  success:true,
                  problems:problems.length ? problems :[] 
            });
            await db.close();
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }  
})

api.get('/lang/:uid',async function(req,res){
      try{
            let uid = req.params.uid;
            let db = await connectMongoDB();
            let collection = db.collection('profiles');
            let query = { 'uid': uid };
            let profile = await collection.findOne(query);
            if(profile){
                  res.json({
                        success:true,
                        language: profile.language ? profile.language.code : 'en'
                  });
                  await db.close();
            }
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }
})

api.get('/problem/:problemId',async function(req,res){
      try{
            let problemId = req.params.problemId;
            let db = await connectMongoDB();
            let collection = db.collection('problems');
            let query = { '_id': new MONGODB.ObjectID(problemId) };
            let problem = await collection.findOne(query);
            if(problem){
                  let userCollection =  db.collection('profiles');
                  let createdBy =  await userCollection.findOne({'uid':problem.uid});
                  let updatedBy = await userCollection.findOne({'uid':problem.editedBy});
                  res.json({
                        success:true,
                        problem:problem,
                        updatedBy:updatedBy ?  updatedBy.displayName : '',
                        createdBy:createdBy ? createdBy.displayName :  ''
                  });
                  await db.close();
            }
      }catch(e){
            res.status(400).send({success:false,error:e.toString()});
      }
})


export const Authn = api;