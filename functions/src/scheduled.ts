import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';

// reference to Firestore
const db = admin.firestore();

// invoked every two minutes (https://crontab.guru/every-2-minutes)
export const everyTwoMinutes =
    functions.pubsub.schedule('*/2 * * * *').onRun((_) => {
        console.log('This will be run every two minutes');
    });

// invoked every hour (https://crontab.guru/every-1-hour) 
// use in scenarios where posts should expire, e.g. stories 
// implement client logic to hide expired post until this func deletes it
export const deleteExpiredPosts =
    functions.pubsub.schedule('0 * * * *').onRun(async (_) => {

        try {
            // get time one day ago
            const dayAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

            // reference to expired posts
            const expiredPostsRef = db.collection('posts').where('created', '<', dayAgo);

            // query snapshot of exprired posts
            const expiredPostsSnap = await expiredPostsRef.get();

            // loop through and delete posts 
            expiredPostsSnap.docs.forEach(async post => {
                if (post.exists) {
                    await post.ref.delete();
                }
            });

        } catch (e) {
            console.log(e);
        }

    });

