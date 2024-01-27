// main.js
const propertiesReader = require("properties-reader");
const path = require("path");

const propertiesPath = path.resolve(__dirname, "conf/db.properties");
const properties = propertiesReader(propertiesPath);

const dbPrefix = properties.get("db.prefix");
const dbUsername = encodeURIComponent(properties.get("db.user"));
const dbPwd = encodeURIComponent(properties.get("db.pwd"));
const dbUrl = properties.get("db.dbUrl");
const dbParams = properties.get("db.params");

const uri = dbPrefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;


// dbConnection.js
const { MongoClient, ServerApiVersion } = require("mongodb");

const dbName = properties.get("db.dbName");

const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const db = client.db(dbName);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; // Rethrow the error for the calling code to handle
  }
}

function getDbInstance() {
  return db;
}

async function closeDatabaseConnection() {
  try {
    await client.close();
    console.log("Disconnected from the database");
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw error; // Rethrow the error for the calling code to handle
  }
}

module.exports = {
  connectToDatabase,
  getDbInstance,
  closeDatabaseConnection,
};
