// app.js
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const dbConnection = require('./dbconnection');
const app = express();
app.use(bodyParser.json());

// Middleware to handle database collection based on parameter
app.param('collectionName', async function (req, res, next, collectionName) {
  app.use(cors());
  try {
    const database = dbConnection.getDbInstance();

    if (database) {
      req.collection = database.collection(collectionName);
      return next();
    } else {
      return res.status(500).send('Internal Server Error: Database connection not established.');
    }
  } catch (error) {
    console.error('Error in middleware:', error);
    return res.status(500).send('Internal Server Error: Failed to get database instance.');
  }
});
app.use(cors());

app.get('/collections/:collectionName/search', async function (req, res, next) {
  try {
    // Ensure the database connection is established
    await dbConnection.connectToDatabase();

    // Access the database instance
    const db = dbConnection.getDbInstance();

    // Set req.collection for further use in the route
    req.collection = db.collection(req.params.collectionName);

    // Extract the search query parameters from the request
    const { subject, location } = req.query;

    // Build the MongoDB query based on the provided parameters
    const query = {};

    if (subject) {
      query.subject = { $regex: new RegExp(subject, 'i') };
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    // Use the collection to find documents matching the search query
    const results = await req.collection.find(query).toArray();

    // Send the search results in the response
    res.send(results);
  } catch (error) {
    console.error('Error during route processing:', error);
    next(error); // Pass the error to the next middleware or error handler
  }
});

// Route to retrieve documents from a collection with sorting
app.get('/collections/:collectionName', async function (req, res, next) {
  try {
    console.log('Middleware executed');

    // Ensure the database connection is established
    await dbConnection.connectToDatabase();

    // Access the database instance
    const db = dbConnection.getDbInstance();

    // Set req.collection for further use in the route
    req.collection = db.collection(req.params.collectionName);

    // Use the collection to find documents and sort by a specific field
    const results = await req.collection.find({}).sort({ price: 1 }).toArray();

    // Send the sorted results in the response
    res.send(results);
  } catch (error) {
    console.error('Error during route processing:', error);
    next(error); // Pass the error to the next middleware or error handler
  }
});

app.get('/collections/:collectionName/:documentId', async function (req, res, next) {
  try {
    console.log('Middleware executed');

    // Ensure the database connection is established
    await dbConnection.connectToDatabase();

    // Access the database instance
    const db = dbConnection.getDbInstance();

    // Set req.collection for further use in the route
    req.collection = db.collection(req.params.collectionName);

    // Extract the document ID from the request parameters
    const documentId = req.params.documentId;

    // Use the collection to find a document by its ID
    const result = await req.collection.findOne({ _id: new ObjectId(documentId) });

    // Check if the document was found
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: 'Document not found' });
    }
  } catch (error) {
    console.error('Error during route processing:', error);
    next(error); // Pass the error to the next middleware or error handler
  }
});

app.delete('/collections/:collectionName/:documentId', async function (req, res, next) {
  try {
    // Ensure the database connection is established
    await dbConnection.connectToDatabase();

    // Access the database instance
    const db = dbConnection.getDbInstance();

    // Set req.collection for further use in the route
    req.collection = db.collection(req.params.collectionName);

    // Extract the document ID from the request parameters
    const documentId = req.params.documentId;

    // Use the collection to delete a document by its ID
    const result = await req.collection.deleteOne({ _id: new ObjectId(documentId) });

    // Check if the document was deleted
    if (result.deletedCount === 1) {
      console.log("Item with object id "+ documentId + "deleted")
      res.status(204).send(); // No content (success)
    } else {
      res.status(404).send({ message: 'Document not found' });
    }
  } catch (error) {
    console.error('Error during route processing:', error);
    next(error); // Pass the error to the next middleware or error handler
  }
});

app.post('/collections/:collectionName', async function (req, res, next) {
  try {
    // Ensure the database connection is established
    await dbConnection.connectToDatabase();

    // Access the database instance
    const db = dbConnection.getDbInstance();

    // Set req.collection for further use in the route
    req.collection = db.collection(req.params.collectionName);

    // Extract the data from the request body
    const postData = req.body;

    // Use the collection to insert a new document
      const result = await req.collection.insertOne(postData);
    
      // Check if the document was inserted
      if (result.acknowledged != false) {
        res.status(201).send({message: "This was successful"}); // Created (success) and send the inserted document
      } else {
        console.error('Failed to insert document. Insert result:', result);
        res.status(500).send({ message: 'Failed to insert document' });
      }
  } catch (error) {
    console.error('Error during route processing:', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Run the application
async function runApp() {
  try {
    // Connect to the database
    await dbConnection.connectToDatabase();

    // Close the database connection when done
    // await dbConnection.closeDatabaseConnection();
  } catch (error) {
    console.error('Error running the application:', error);
  }
}

// Run the application
runApp();
