const mongodb = require("mongodb");

const dataBase = "setare";

const mongodbEndpoint = process.env.MONGO_URL;

const client = new mongodb.MongoClient(mongodbEndpoint);
async function connect() {
  try {
    await client.connect();
    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
}
function getCollection(db = dataBase, collection) {
  return client.db(db).collection(collection);
}
async function countCollection(mycollection, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.countDocuments();
}
async function insertOne(mycollection, data, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.insertOne(data);
}
async function insertMany(mycollection, dataArray, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.insertMany(dataArray);
}

async function findOne(mycollection, queryObj, options, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.findOne(queryObj, options);
}
async function find(mycollection, queryObj, db = dataBase) {
  const collection = getCollection(db, mycollection);

  return await collection.find(queryObj);
}
async function updateOne(
  mycollection,
  queryObj,
  data,
  upsert = false,
  db = dataBase
) {
  const collection = getCollection(db, mycollection);
  return await collection.updateOne(
    queryObj,
    { $set: data },
    {
      upsert,
    }
  );
}
async function updateMany(mycollection, queryObj, data, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.updateMany(queryObj, { $set: data });
}
async function deleteOne(mycollection, queryObj, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.deleteOne(queryObj);
}
async function deleteMany(mycollection, queryObj, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.deleteMany(queryObj);
}
async function findOneAndDelete(mycollection, queryObj, db = dataBase) {
  const collection = getCollection(db, mycollection);
  return await collection.findOneAndDelete(queryObj);
}
module.exports = {
  getCollection,
  insertOne,
  findOne,
  find,
  updateOne,
  updateMany,
  deleteMany,
  deleteOne,
  countCollection,
  findOneAndDelete,
  client,
  connect,
  insertMany,
  dataBase,
};
