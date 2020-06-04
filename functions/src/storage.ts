import * as functions from 'firebase-functions';
//npm i @types/request
import * as req from "request";
// npm i @google-cloud/vision
const vision = require('@google-cloud/vision');

// create new image annotator instance
const visionClient = new vision.ImageAnnotatorClient();

// invoked when upload to storage bucket completes
// check image for nudity and notify moderation team if required
export const notifyModerators = functions.storage.object().onFinalize(async (object) => {

    try {

        // check if image has already been blurred
        const filePath = object.name;
        const fileName = filePath?.split('/').pop();
        const fileDir = filePath?.split('/')[0];

        // enable cloud vision via URL provided in function logs
        // perform image analysis 
        const data = await visionClient.safeSearchDetection(
            `gs://${object.bucket}/${object.name}`
        );

        // get safe search annonation
        const safeSearch = data[0].safeSearchAnnotation;

        // search options: .adult, .spoof, .medical, .violence, .racy
        // certainty level: UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY

        // if not very likely that image contains nudity, return
        if (safeSearch.adult !== 'VERY_LIKELY') {
            return null;
        }

        // send Slack message to the moderation team with URL from .env
        return req.post(process.env.SLACK_URL!, {
            json: { text: `ALERT: Image "${fileName}" in directory "${fileDir}" may contain nudity 🔞👀` }
        });

    } catch (e) {
        console.log(e)
        return e;
    }

});



