const router = require('koa-router')()
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('192.168.99.100:27017/msadb');//localhost:27017
var users = wrap(db.get('userlist'));

var zookeeper = require('node-zookeeper-client');

var CONNECTION_STRING = '192.168.99.100:2181';
var REGISTRY_ROOT = '/registry';

var registryPath =  REGISTRY_ROOT;
var servicePath = REGISTRY_ROOT + '/HelloService';
var addressPath=servicePath+'/address-';
var serviceAddress='192.168.99.100:3000/userlist'

var zk = zookeeper.createClient(CONNECTION_STRING);
zk.connect();

let registermsa = (path,type) => {
  return new Promise((resolve,reject) => {
    if (type==0) {
      zk.create(path, function (error) {
        if (error) {
          console.log('Failed to create node: %s due to: %s.', path, error);
          resolve(-1)
        } else {
          console.log('Node: %s is successfully created', path);
          resolve(1)
        }
      });
    }
    if (type==1) {
      zk.create(path, new Buffer(serviceAddress),null,3, function (error) {
        if (error) {
          console.log('Failed to create api node: %s due to: %s.', path, error);
          resolve(-1)
        } else {
          console.log('api node: %s is successfully created', path);
          resolve(1)
        }
      });
    }
  });
}

registermsa(registryPath,0)
registermsa(servicePath,0)
registermsa(addressPath,1)

router.get('/', async (ctx, next) => {
  // let zkc0 = await registermsa(registryPath,0)
  // let zkc1 = await registermsa(servicePath,0)
  // let zkc2 = await registermsa(addressPath,1)
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})


let getUserList = () => {
  return new Promise((resolve,reject)=>{
    users.find({},function(err, docs) {
        console.log(docs)
        //var userArray=[];
        for (var i in docs) {
          console.log(docs[i]);
          //userArray.push(docs[i])
        }
        resolve(docs)
      })
  })
}

router.get('/userlist', async (ctx, next) => {

    let doc= await  getUserList()
    ctx.body=JSON.stringify(doc)
})


module.exports = router
