import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// npm i @types/nodemailer
import * as nodemailer from 'nodemailer';
// npm i @types/dotenv
import * as dotenv from "dotenv";

// configure .env credentials 
// call once throughout entire project
dotenv.config();
// call once throughout entire project
admin.initializeApp();

// reference to Firestore
const db = admin.firestore();
// reference to Cloud Storage
const storage = admin.storage();

// deconstruct credentials from .env
const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;
// your app's name
const APP_NAME = 'AwesomeApp';

// invoked when new user signs up
// send welcome email
export const welcomeEmail = functions.auth.user().onCreate((user, _) => {

    try {
        // new user's email address
        const email = user.email;

        // create transporter with sender credentials from .env 
        const transporter = nodemailer.createTransport({
            // specify SENDER_EMAIL provider
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_PASSWORD
            }
        });

        // compose and send email to new user 
        return transporter.sendMail({
            from: SENDER_EMAIL,
            to: email,
            subject: `Welcome to ${APP_NAME}`,
            // display either text or html in email body
            // if both specified, only HTML shown
            text: `We're happy to have you onboard`,
            //html: `<h1>Hello World</h1>`,
        });

    } catch (e) {
        console.log(e);
        return e;
    }
});

// invoked when user deletes account
// delete user's firestore and storage data
export const deleteData = functions.auth.user().onDelete(async (user, _) => {

    try {
        // former user's unique id 
        const userId = user.uid;

        // get reference to former user's firestore document 
        const userRef = db.doc(`users/${userId}`);
        // delete former user's firestore document 
        await userRef.delete();

        // get reference to default storage bucket
        const defaultBucket = storage.bucket();

        // delete all files directory 
        return defaultBucket.deleteFiles({
            prefix: userId,
        });

    } catch (e) {
        console.log(e);
        return e;
    }
});

