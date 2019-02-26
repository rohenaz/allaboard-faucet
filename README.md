# All Aboard: Faucet [Demo Application](https://faucet.allaboard.cash)
Example faucet web application using the [AllAboard faucet api](https://allaboard.cash/docs). This example uses [Firebase](https://firebase.google.com) for the demo [static webpage](https://firebase.google.com/docs/hosting/) and demo serverless [cloud functions](https://firebase.google.com/docs/functions/).

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
Checkout the [quickstart](https://firebase.google.com/docs/hosting/quickstart) for Firebase and if you want to run the serverless functions locally checkout the [Firebase local emulator](https://firebase.google.com/docs/functions/local-emulator).

1) Use your [Google Firebase account](https://console.firebase.google.com/) and **create a new project** in Firebase

2) **Turn on the Blaze plan**, aka "Pay as You Go" in the billing section (required to make external cloud function requests)

3) **Install the [Firebase CLI](https://firebase.google.com/docs/hosting/quickstart#install_the_firebase_cli)**

4) **Login to Firebase** (opens a web browser to login to Google)
```bash
$ firebase login

 ? Allow Firebase to collect anonymous CLI usage and error reporting information? No
```

5) **Initialize the project** from inside your project directory.
```bash
$ cd /Users/YourName/projects/my-demo-faucet
$ firebase init
```

Choose these settings to host a static website with serverless Cloud Functions
```
 * You are initializing in an existing Firebase project directory
  
? Which Firebase CLI features do you want to setup for this folder?
❯ ◉ Functions: Configure and deploy Cloud Functions
❯ ◉ Hosting: Configure and deploy Firebase Hosting sites
 
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

6) Go to [AllAboard](https://allaboard.cash) and **generate a new [faucet api key](https://allaboard.cash)**.

7) **Set an environment variable** in Cloud Functions for the above faucet api key
```bash 
$ firebase functions:config:set allaboard.key="YOUR_FAUCET_KEY"
```

8) **Deploy the code** and functions (takes a few minutes the first time)
```bash
$ firebase use Your-Firebase-Project-ID
$ firebase deploy
```

#### Testing Firebase Deployment

- First, test that the website deployed by opening a web browser and navigating to the url:
```
https://Your-Firebase-Project-ID.firebaseapp.com/
```

- Second, test your cloud function to see it returns the desired response (address, balance):
```bash
$ curl -X GET https://us-central1-Your-Firebase-Project-ID.cloudfunctions.net/status

{"address":"14U9TLN3u9ncW2YQQJCMThBoB9XNigBDvN","balance":0}
```

## Documentation
- More information about the AllAboard faucet api can be [found here](https://allaboard.cash/docs).

## Examples
- View the [live faucet demo application](https://faucet.allaboard.cash)

## Code Standards
- Always use the language's best practices
- For the serverless cloud functions we follow the [ESLint rules](https://github.com/rohenaz/allaboard-faucet/blob/master/functions/.eslintrc.json).

## Usage
- Use this [current demo](https://faucet.allaboard.cash) to create a cloud based web application in minutes
- Setup your own custom application using the [AllAboard api](https://allaboard.cash/docs)

## Maintainers

[Satchmo](https://github.com/rohenaz) - [MrZ](https://github.com/mrz1836)

Support the development of this project and the [AllAboard](https://allaboard.cash) team 🙏

[![Donate](https://img.shields.io/badge/donate-bitcoin%20SV-brightgreen.svg)](https://allaboard.cash/?af=allaboard-faucet)

## Contributing
Feel free to dive in! [Open an issue](https://github.com/rohenaz/allaboard-faucet/issues/new) or submit PRs.


## License
![License](https://img.shields.io/github/license/rohenaz/allaboard-faucet.svg?style=flat)