# allaboard-faucet [demo application](https://faucet.allaboard.cash)
Example faucet web application using the [allaboard faucet api](https://allaboard.cash/docs). This example uses [Firebase](https://firebase.google.com) for the demo [static webpage](https://firebase.google.com/docs/hosting/) and demo serverless [cloud functions](https://firebase.google.com/docs/functions/).

![License](https://img.shields.io/github/license/rohenaz/allaboard-faucet.svg?style=flat)  [![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat)](https://github.com/RichardLitt/standard-readme)

## Table of Contents
- [Installation](https://github.com/rohenaz/allaboard-faucet#installation)
- [Documentation](https://github.com/rohenaz/allaboard-faucet#documentation)
- [Examples](https://github.com/rohenaz/allaboard-faucet#examples)
- [Code Standards](https://github.com/rohenaz/allaboard-faucet#code-standards)
- [Usage](https://github.com/rohenaz/allaboard-faucet#usage)
- [Maintainers](https://github.com/rohenaz/allaboard-faucet#maintainers)
- [Contributing](https://github.com/rohenaz/allaboard-faucet#contributing)
- [License](https://github.com/rohenaz/allaboard-faucet#license)

## Installation

#### Using Firebase (fastest)
Checkout the [quickstart](https://firebase.google.com/docs/hosting/quickstart) for firebase and if you want to run the serverless functions locally checkout the [firebase local emulator](https://firebase.google.com/docs/functions/local-emulator).

1) Use your [Google firebase account](https://console.firebase.google.com/) and create a **new project** in firebase
- Project creation is only available from the [Firebase Console](https://console.firebase.google.com)

2) Turn on the Blaze plan, "Pay as You Go" in the billing section (required to make external cloud function requests)

3) Install the [firebase cli](https://firebase.google.com/docs/hosting/quickstart#install_the_firebase_cli)

4) Login to firebase (opens a web browser to login to Google)
```bash
$ firebase login

    ? Allow Firebase to collect anonymous CLI usage and error reporting information? No
    
    Waiting for authentication...
    
    ✔  Success! Logged in as janedoe@example.com

```

5) Run firebase init from inside your repository directory.
```bash
$ cd /Users/YourName/projects/my-demo-faucet
$ firebase init
```

Choose these settings to host a static webpage with serverless Cloud Functions
```
 * You are initializing in an existing Firebase project directory
  
? Which Firebase CLI features do you want to setup for this folder?
 ◯ Database: Deploy Firebase Realtime Database Rules
 ◯ Firestore: Deploy rules and create indexes for Firestore
 ◉ Functions: Configure and deploy Cloud Functions
❯◉ Hosting: Configure and deploy Firebase Hosting sites
 ◯ Storage: Deploy Cloud Storage security rules
 
? What language would you like to use to write Cloud Functions? JavaScript

? Do you want to use ESLint to catch probable bugs and enforce style? Yes

? File functions/package.json already exists. Overwrite? No

? File functions/.eslintrc.json already exists. Overwrite? No

? File functions/index.js already exists. Overwrite? No

? Do you want to install dependencies with npm now? Yes

? What do you want to use as your public directory? public

? Configure as a single-page app (rewrite all urls to /index.html)? Yes

? File public/index.html already exists. Overwrite? No
```

6) Go to [allaboard](https://allaboard.cash) and generate a new [faucet api key](https://allaboard.cash). Store that key securely and treat it as safe as a password.

7) Set an environment variable in Cloud Functions for the faucet key
```bash 
$ firebase functions:config:set allaboard.key="YOUR_FAUCET_KEY"
```

8) Deploy the code and functions (takes a few minutes the first time)
```bash
$ firebase use Your-Firebase-Project-ID
$ firebase deploy
```

- First, test that the website deployed by opening a web browser and entering:
```
https://Your-Firebase-Project-ID.firebaseapp.com/
```

- Second, test your cloud function to see it returns the desired response:
```
curl -X GET \
  https://us-central1-Your-Firebase-Project-ID.cloudfunctions.net/status \
  -H 'cache-control: no-cache'
  
  {"address":"14U9TLN3u9ncW2YQQJCMThBoB9XNigBDvN","balance":0}
```

## Documentation
- More information about the allaboard faucet api can be [found here](https://allaboard.cash/docs).

## Examples
- View the [live example](https://faucet.allaboard.cash)

## Code Standards
- For the serverless functions we follow the [ESLint rules](https://github.com/rohenaz/allaboard-faucet/blob/master/functions/.eslintrc.json).

## Usage
- Use this [demo](https://faucet.allaboard.cash) to create a cloud based faucet webpage in minutes
- Setup your own custom application using the [allaboard api](https://allaboard.cash/docs)

## Maintainers

[Satchmo](https://github.com/rohenaz) - [MrZ](https://github.com/mrz1836)

Support the development of this project 🙏

[![Donate](https://img.shields.io/badge/donate-bitcoin%20SV-brightgreen.svg)](https://allaboard.cash/?af=allaboard-faucet)

## License

![License](https://img.shields.io/github/license/rohenaz/allaboard-faucet.svg?style=flat)
