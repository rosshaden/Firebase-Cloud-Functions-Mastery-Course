import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// npm i @types/nodemailer
import * as nodemailer from 'nodemailer';

// reference to Firebase auth
const auth = admin.auth();
// reference to Firestore
const db = admin.firestore();

// deconstruct credentials from .env
const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;
// your app's name
const APP_NAME = 'AwesomeApp';

// when available, auth and FCM token automatically in passed via context param
export const dataRequest = functions.https.onCall(async (data, context) => {

    try {

        // get user data
        const userId = context.auth!.uid;
        const userRef = db.doc(`users/${userId}`);
        const userSnap = await userRef.get();

        // check user document exist
        if (!userSnap.exists) {
            return { code: 404, success: false, message: "user doc not found" }
        }

        const userData = userSnap.data();
        const email = userData!.email;

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
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: email,
            subject: `Here's your ${APP_NAME} data`,
            attachments: [
                {
                    filename: 'data.txt',
                    //convert JSON to string             format 
                    content: JSON.stringify(userData, null, 1),
                },
            ],
        });

        // check if delete true
        if (data.delete === true) {
            // delete user from Firebase auth
            await auth.deleteUser(userId);
            return { code: 200, success: true, message: 'email sent and account deleted' }
        }

        return { code: 200, success: true, message: 'email sent' }

    } catch (e) {
        console.log(e);
        return e;
    }

});
