let apiUrl = 'https://faucet.allaboardbitcoin.com'
let showRefill = false
let ADDR = null
let tapAddress = null
let audio = new Audio('drop.mp3')
let user = null
let token = null
audio.load()

let FBconfig = {
  apiKey: "AIzaSyBH3VVsYUAHlQLibXc3DIwfZ5dRGGelyNg",
  authDomain: "faucet.allaboardbitcoin.com",
  projectId: "faucet-6dcc5",
}
firebase.initializeApp(FBconfig)
  
const tap = async (address) => {
  let btnEl = document.querySelector('button')
  btnEl.disabled = true
  let params = {
    address : address
  }
 
  try {  
    token = await firebase.auth().currentUser.getIdToken(true)
  
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + token
    }

    let res = await axios.post(apiUrl + '/tap', Qs.stringify(params), {headers})
    btnEl.disabled = false
    return res
  } catch (e) {
    throw e.response ? e.response.data : e
  }
}

const updateStatus = async () => {
  console.log('updating status')
  const res = await fetch(apiUrl + '/status', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    'credentials': 'omit'
  })
  return await res.json()
}

const toggleRefill = () => {
  let refillBtnEl = document.querySelector('.refill-btn')
  let refillContainerEl = document.querySelector('.refill-container')
  let qrEl = document.querySelector('.qr')
  if (showRefill) {
    refillBtnEl.style.display = "block"
    refillContainerEl.style.display = "none"
  } else {
    refillBtnEl.style.display = "none"
    refillContainerEl.style.display = "block"
    let img = document.createElement('img')
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ADDR}&format=svg&bgcolor=000000&color=FFFFFF`
    img.onload = () => {
      img.style.opacity = '1'
    }
    qrEl.appendChild(img)
  }
  showRefill = !showRefill
}

const setTapped = (txid) => {  
  document.querySelector('#phone-modal').style.display = 'none'
  document.querySelector('input').style.display = 'none'
  document.querySelector('.balance-container').style.display = 'none'
  let oldEl = document.querySelector('button')
  let parent = document.querySelector('.centerme')
  let link = document.createElement('a')
  if (!txid || !txid.length) {
    return
  }
  //link.href = `https://whatsonchain.com/tx/${txid}` //Whats On Chain
  link.href = `https://blockchair.com/bitcoin-sv/transaction/${txid}` //BlockChair
  link.target = `_blank`
  link.innerHTML = `<i class='fa fa-external-link'></i> Tapped<br />`
  parent.replaceChild(link, oldEl)
  localStorage.setItem('tapped', txid)
}


const tapCheck = async () => {
  // Find recent tap tx - Bitquery (mongodb) syntax
  let query = {
    "v": 3,
    "q": {
      "find": { "tx.h": localStorage.getItem('tapped') },
      "project": { "tx": 1 }
    },
    "r": {"f": "[ .[] | {tx: .tx.h} ]"}
  }

  // Bitdb expects a base64 encoded string
  let b64 = btoa(JSON.stringify(query))
  let url = "https://chronos.bitdb.network/q/1P6o45vqLdo6X8HRCZk8XuDsniURmXqiXo/" + b64

  // Attach API KEY as header
  let header = {
    headers: { key: '12raDWbYT8dc1qsE3SRK87C47hhXYnMAJM' }
  }

  // Make an HTTP request to bitdb.network public endpoint
  let r = await fetch(url, header)
  let json = await r.json()
  return json.t.length > 0
}

const updateMoneyButton = (address) => {

  const mbDiv = document.getElementById('mb')
  let options = {
    clientIdentifier: '7681f38e7e289ac46bbefc36905a27b4',
    outputs: [
      {
        to: "1372",
        amount: ".01",
        currency: "USD"
      },
      {
        to: address,
        amount: ".10",
        currency: "USD"
      }
    ],
    onPayment: (arg) => {
      console.log('payment success', arg)
      setTimeout(async () => {
        let json = await updateStatus()
        updateUI(json)
      }, 1000)
    },
  }

  // Attach TonicPow session id if it exists
  const qparams = new URLSearchParams(window.location.search)
  let session_id = qparams.get("tncpw_session")
  if (session_id && session_id.length > 0) {
    options.buttonData = '{"tncpw_session": "'+ session_id +'"}'
  }

  moneyButton.render(mbDiv, options)
}

const updateUI = async (json) => {
  console.log('update ui')
  ADDR = json.address
  document.querySelector('#nextAddress').innerHTML = `<a href="bitcoin:${json.address}?sv">${json.address}</a>`

  updateMoneyButton(json.address)
  let tappedTx = localStorage.getItem('tapped')
  if (tappedTx && tappedTx.length === 64) {
    let tapped = await tapCheck()
    if (tapped) {
      setTapped(tappedTx)
      document.querySelector('.centerme').style.opacity = '1'
      return
    }
  }
  document.querySelector('#balance').innerHTML = json.balance
  document.querySelector('.centerme').style.opacity = '1'
  console.log(document.querySelector('#tap-button').disabled)
  document.querySelector('#tap-button').disabled = false
}

const captchaVerifiedCallback = async () => {
  console.log('Captcha verified. Tapping with', tapAddress)
  // Tap tap taparoo
  let resp
  try {
    resp = await tap(tapAddress)
    console.log('you tapped the rockies', resp)
    await audio.play()
    setTapped(resp.txid)
    return resp
  } catch (e) {
    document.querySelector('#tap-button').disabled = true
    throw e
  }
}

firebase.auth().onAuthStateChanged((user) => { // this runs on login
  if (user) { // user is signed in
    resetReCaptcha()
    // user.getIdToken(true).then((idToken) => {
    //   console.log('token refreshed', idToken)
    //   token = idToken
    //   // Send token to your backend via HTTPS
    //   // ...
    // }).catch(function(error) {
    //   // Handle error
    // })
    // $scope.authData = user;
    // firebase.database().ref('userLoginEvent').update({'user': user.uid}); // update Firebase database to trigger Cloud Function
  } // end if user is signed in
  else { // User is signed out
    console.log("User signed out. auth state change", user)
  }
}); // end onAuthStateChanged

const inIframe = () => {
  return window.location !== window.parent.location
}

const resetReCaptcha = () => {
  if (typeof grecaptcha !== 'undefined'
      && typeof window.recaptchaWidgetId !== 'undefined') {
    grecaptcha.reset(window.recaptchaWidgetId);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log('content loaded')
  // if (!inIframe) {

  // }

  // recaptchaVerifier.verify()
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': async (response) => {
      console.log('callback', response)
      if (response && response.length > 0) {
        // g78wrguyvgvgvcaptchaVerifiedCallback(response)
        console.log('skipping callback', response)
        return response
      } else {
        // show me failures in the function logs
        document.querySelector('#tap-button').disabled = true
        // ToDo - send failed captchas
        // await axios.get(apiUrl + '/recaptcha/?failed=true&ua='+ navigator.userAgent)
      }
    }
  })
  console.log('try render here', recaptchaVerifier)
  recaptchaVerifier.render().then(function(widgetId) {
    console.log('captcha rendered', widgetId)
    window.recaptchaWidgetId = widgetId
  }).catch((e) => {
    console.error('error', e)
  })

  let video = document.querySelector('video')
  video.src = "framefix.m4v"
  video.oncanplay = () => {
    video.style.opacity = 1
  }
  video.load()
  updateStatus().then((json) => {
    updateUI(json)
  })

  document.querySelector('#tap-button').addEventListener('click', async (e) => {
    // Update UI  was already called, so we can assume if the button exists they are untapped
    tapAddress = document.querySelector('input').value
    // if handcash handle or bitcoin address
    if (!tapAddress) { return }
    let bitcoinRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/ // /[\$\#][\S]*[^ .,]/
    if (!bitcoinRegex.test(tapAddress)) {
        // lookup via polynym
        try {
            let polynym = await axios.get('https://api.polynym.io/getAddress/' + tapAddress)
            tapAddress = polynym.data.address
            console.log('tap address is', tapAddress)
        } catch (e) {
            alert('Couldn\'t get handle address')
            return
        }
    }
    if  ((tapAddress.length !== 34 || !tapAddress.startsWith('1')) && tapAddress.indexof('@') === -1) {
        alert('Not a valid Bitcoin address')
        return
    }
    // let phone = prompt('Enter your phone number for verification. Must include +1 or other country code. \nEx. "+1 954 954 9544"', '')
    
    document.querySelector('#phone-modal').style.display = 'block'
    document.querySelector('#phone-submit').addEventListener('click', async (e) => {
      // check phone number validity
      var phone = iti.getNumber()
      if (!iti.isValidNumber() && phone !== '+19999999999') {
        console.error('Invalid number', phone)
        return
      }
    
      let appVerifier = window.recaptchaVerifier
      firebase.auth().signInWithPhoneNumber(phone, appVerifier)
      .then(async (confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        let code = prompt('Enter the confirmation code', '')
        if (!code || !code.length) {
          throw {message: 'Sorry. No code, no BSV.'}
        }
       
        let sendCodeBtn = document.getElementById('phone-submit')
        sendCodeBtn.disabled = true

        await recaptchaVerifier.verify()

        try {
          let result = await confirmationResult.confirm(code)
          // User signed in successfully.
          user = result.user
  
          // Sign in so the firebase function can get the user
          // var credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, code)
          // await firebase.auth().signInWithCredential(credential)
          let resp
          
          resp = await captchaVerifiedCallback()
          sendCodeBtn.disabled = false
          console.info('All done', resp)
        } catch(e) {
          console.log('resetting captcha')
          recaptchaVerifier.reset(window.recaptchaWidgetId)
          sendCodeBtn.disabled = true
          throw e
        }
        
      }).catch(e => {
        // Error; SMS not sent
        console.error(e)
        alert(e.error ? e.error : e.message ? e.message : e)
        document.querySelector('#phone-modal').style.display = 'none'
      })
    })
  })

  // var showCreateFaucet = false
  // document.querySelector('#createFaucetBtn').addEventListener('click', async (e) => {

  //   if (!showCreateFaucet) {
  //     console.log('show ')
  //     document.querySelector('#createFaucetForm').style.removeClass('hidden')
  //   } else {
  //     console.log('hide create faucet form')
  //     document.querySelector('#createFaucetForm').style.addClass('hidden')
  //   }

  // })
})
