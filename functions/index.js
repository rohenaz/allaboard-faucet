// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const rp = require('request-promise');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.tap = functions.https.onRequest(async (req, res) => {
    let headers = req.headers;
    headers.key = functions.config().allaboard.key;
    req.headers = headers;
    try {
        let response = await rp(req);
        return res.send(response);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Something went wrong while sending to allaboard.');
    }
  });
  

  // Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.status = functions.https.onRequest(async (req, res) => {
    try {
        let response = await rp({
            method: 'GET',
            // TODO: Configure the `slack.webhook_url` Google Cloud environment variables.
            uri: url,
            header: {
                key: functions.config().allaboard.key 
            },
            body: {
              text: `<${url}|${commits} new commit${commits > 1 ? 's' : ''}> pushed to <${repo.url}|${repo.full_name}>.`,
            },
            json: true,
          });
        
        //postToSlack(req.body.compare, req.body.commits.length, req.body.repository);
        return res.send(ressponse);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Something went wrong while posting the message to Slack.');
    }
});
