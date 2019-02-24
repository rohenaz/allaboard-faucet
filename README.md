# allaboard-faucet

# To Deploy with Firebase
https://firebase.google.com/docs/hosting/quickstart

`firebase login`

`firebase init`

Choose hosting and functions

/public for hosting

/functions for functions

Set environmental variable for the faucet key you received from the `create` endpoint

`firebase functions:config:set allaboard.key="YOUR_FAUCET_KEY"`

`cd /functions`

`npm install`

`firebase deploy`
