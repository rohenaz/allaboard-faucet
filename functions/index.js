// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')

// All HTTPS requests via promises
const rp = require('request-promise')

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin')

const TonicPow = require('tonicpow-js').default
var tonicpow = new TonicPow({ advertiser_secret_key: functions.config().tonicow.advertiser_secret })

admin.initializeApp()

// AllAboard api url endpoint
const apiUrl = 'https://api.allaboardbitcoin.com/faucet'

// Name: /mbwebhook
// Method: GET
// Description: Webhook triggers when faucet moneybutton is interacted with
// Returns: 200 on Success
exports.mbwebhook = functions.https.onRequest(async (req, res) => {
  // moneybutton sends
  // { secret, payment }
  // let cors = handleCors(req, res)
  console.log('webhook from moneybutton', req.body)
  // req.body.payment
  if (req.body.secret === functions.config().moneybutton.webhook_secret) {
    if(!req.body.payment || !req.body.payment.buttonData) {
      // Webhook for user without a tncpw_session
      console.log('no buttonData')
      return res.status(200).send('')
    }

    let buttonData = JSON.parse(req.body.payment.buttonData)
    if (!buttonData.tncpw_session || buttonData.tncpw_session === '' || buttonData.tncpw_session === 'null') {
      console.log('no tncpw_session')
      return res.status(200).send('')
    }

    // Validate amount is exactly $0.11
    let amount = Number(parseFloat(req.body.payment.amount).toFixed(2))
    if (amount !== 0.11) {
      console.log('wrong amount')
      return res.status(200).send('')
    }

    let sessionID = buttonData.tncpw_session
    try {
      // let response = await apiRequest(cors.req, '/tap')
      let response = await tonicpow.api.triggerConversion(sessionID, 'donate') 
      console.log('triggered conversion:', response)
      return res.status(200).send('')
    } catch (error) {
      console.error('error', error)
      return res.status(error.statusCode).send(error.error)
    }
  }
  // Bad secret
  return res.status(401).send('')

  // https://faucet.allaboardbitcoin.com/mbwebhook
})

// Name: /tap
// Method: POST
// Description: Used to tap the faucet via AllAboard
// Returns: 200 on Success
exports.tap = functions.https.onRequest(async (req, res) => {

  let cors = handleCors(req, res)

  // comment out this if guard for Maintenance mode
  if (!cors.req.headers['authorization'] || !cors.req.headers['authorization'].startsWith('Bearer ') || !validUA(cors.req.headers['user-agent'])) {
    // Unauthorised. Play alive
    console.log('no valid auth header present')
    return cors.res.status(200).send('')
  }
  console.log('attempt to validate token')
  let decodedToken
  try {
    // idToken comes from the client app
    decodedToken = await admin.auth().verifyIdToken(cors.req.headers['authorization'].split('Bearer ')[1])
  } catch(error) {
    // Unauthorised. Play alive
    console.log('Invalid user token. Play alive')
    return cors.res.status(200).send('')
  }

  try {
    console.log('uid', decodedToken, decodedToken.uid)
    cors.req.firebase_token = decodedToken
    let response = await apiRequest(cors.req, '/tap')
    return cors.res.send(response)
  } catch (error) {
    console.error(error.statusCode, error.error)
    return cors.res.status(error.statusCode).send(error.error)
  }
})

// Name: /status
// Method: GET
// Description: Used to get the status of the faucet (address, balance)
// Returns: 200 on Success, JSON body
exports.status = functions.https.onRequest(async (req, res) => {
  let cors = handleCors(req, res)

  // comment out this if guard for Maintenance mode
  if (!validUA(cors.req.headers['user-agent'])) {
    // Unauthorised. Play alive
    return cors.res.status(200).send('')
  }

  try {
    let response = await apiRequest(cors.req, '/status')
    return cors.res.send(response)
  } catch (error) {
    console.error(error.statusCode, error.error)
    return cors.res.status(error.statusCode).send(error.error)
  }
})

// Handle all Cors for OPTION requests and all other requests
const handleCors = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
  } 
  res.set('Access-Control-Allow-Origin', '*')
  return {req: req, res: res}
}

// Standard AllAboard API request
const apiRequest = (req, path) => {
  console.log('requesting url: ', apiUrl + path, ' method: ', req.method, ' body: ', req.body, ' form data: ', req.formData, ' ip: ', req.ips[0], 'ua: ', req.headers['user-agent'])

  let headers = {}

  // This is the environment variable that was set via Firebase CLI
  headers.key = functions.config().allaboard.key

  // Send the client IP address (used for limiting via 24 hours)
  headers.ip = req.ips[0]

  let options = {
    headers: headers,
    json: true,
    method: req.method,
    uri: apiUrl + path
  }
  if (req.method === 'POST') {
    options.form = req.body
  }
  return rp(options)
}

const validUA = (ua) => {
  let torUAs = [
    // Check for TOR browser
    'Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0'
  ]

  if (torUAs.indexOf(ua) !== -1) {
    console.warn('UNAUTHORIZED REQUEST')
    return false    
  }
  return true
}
