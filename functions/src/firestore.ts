import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// reference to Firestore
const db = admin.firestore();

// invoked when document added to users collection 
// create corresponding document in profiles collection containing only non-private data
export const createProfile = functions.firestore.document("/users/{userId}")
    .onCreate(async (snapshot, context) => {

        try {
            // get document id
            const userId = context.params.userId;

            // get document data 
            const userData = snapshot.data();

            // deconstruct values of non-private fields
            const { username, avatarUrl, bio } = userData;

            // create reference to new document in profiles collection 
            const docRef = db.doc(`/profiles/${userId}`);

            // create new document in profiles collection 
            return docRef.set({
                username: username,
                avatarUrl: avatarUrl,
                bio: bio,
            });

        } catch (e) {
            console.log(e);
            return e;
        }
    });

// invoked when document updated in users collection
// update corresponding document in profiles collection
export const updateProfile = functions.firestore.document(
    "/users/{userId}"
).onUpdate(async (snapshot, context) => {

    try {
        // get document id
        const userId = context.params.userId;

        // get contents of document after update
        // use before.data() to get data before update
        const userData = snapshot.after.data();

        // deconstruct values of non-private fields
        const { username, avatarUrl, bio } = userData;

        // get reference to existing document in profiles collection
        const profileRef = db.doc(`/profiles/${userId}`);

        // update document 
        return profileRef.set({
            avatarUrl: avatarUrl,
            username: username,
            bio: bio
        }, { merge: true });

    } catch (e) {
        console.log(e);
        return e;
    }

});

// invoked when document deleted in users collection
// delete corresponding document in profiles collection
export const deleteProfile = functions.firestore.document("/users/{userId}").onDelete(async (_, context) => {

    try {
        // get document id
        const userId = context.params.userId;

        // get reference to document in profiles collection 
        const profileRef = db.doc(`/profiles/${userId}`);

        // delete document
        return profileRef.delete();

    } catch (e) {
        console.log(e);
        return e;
    }
});