import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// npm i express
import * as express from 'express';

// reference to Firestore
const db = admin.firestore();

// invoked when called from client
// http://localhost:5000/cloud-functions-3d4a5/us-central1/helloHTTP?name=awesome name
export const helloHTTP = functions.https.onRequest((request, response) => {

    try {
        // get name value from query parameter
        const name = request.query.name;

        // check name is not null
        if (!name) {
            // if name null, respond with error 
            // 400 = bad request 
            response.status(400).send('Must specify name');
        }

        // http functions must conclude with a response
        // 200 = OK 
        response.status(200).send(`Hello ${name}`);

    } catch (e) {
        console.log(e);
        // 500 = internal server error 
        response.status(500).send(e);
    }
});

// Planet API with express

// create a new express app
const app = express();

app.get('/v1/planets', async (_, response) => {

    try {
        // get all planet documents from planets collection
        const planetsSnap = await db.collection('planets').get();
        // get data from all documents in snapshot
        const planetsData = planetsSnap.docs.map(doc => doc.data());
        // 200 = OK
        response.status(200).send(planetsData);

    } catch (e) {
        console.log(e);
        // 500 = internal server error 
        response.status(500).send(e);
    }
});

app.get('/v1/planet', async (request, response) => {

    try {
        // get name value from query parameter
        const planetName = request.query.name;

        // check planet is not null
        if (!planetName) {
            // 400 = bad request
            response.status(400).send('Must specify planet name');
        }

        // query planets collection for single document with name field equal to planetName
        const planetSnap = await db.collection('planets').where('name', '==', planetName).limit(1).get();
        // get data from document in snapshot
        const planetData = planetSnap.docs.map(doc => doc.data());

        // check planetData not null
        if (!planetData) {
            // 404 = resource not found
            response.status(404).send('Planet not found');
        }

        // 200 = OK
        response.status(200).send(planetData);

    } catch (e) {
        console.log(e);
        // 500 = internal server error 
        response.status(500).send(e);
    }
});

export const api = functions.https.onRequest(app);








