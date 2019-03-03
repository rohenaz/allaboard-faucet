let apiUrl = 'https://us-central1-faucet-6dcc5.cloudfunctions.net'
let showRefill = false
let ADDR = null
let audio = new Audio('drop.mp3')
audio.load()
const tap = async (address) => {
  let btnEl = document.querySelector('button')
  btnEl.disabled = true
  let params = {
    address : address
  }

  const res = await fetch(apiUrl + '/tap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'omit',
    body: postParams(params)
  })
  let json = await res.json()
  btnEl.disabled = false
  return json
}

const postParams = (params) => {
  if (!params) { return }
  return Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
  }).join('&')
}

const updateStatus = async () => {
  const res = await fetch(apiUrl + '/status', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    'credentials': 'omit'
  })
  json = await res.json()
  return json
}

const toggleRefill = () => {
  console.log('Do we have addr?', ADDR)
  let refillBtnEl = document.querySelector('.refill-btn')
  let refillContainerEl = document.querySelector('.refill-container')
  let qrEl = document.querySelector('.qr')
  if (showRefill) {
    console.log('hide it')
    refillBtnEl.style.display = "block"
    refillContainerEl.style.display = "none"
  } else {
    console.log('show it')
    refillBtnEl.style.display = "none"
    refillContainerEl.style.display = "block"
    let img = document.createElement('img')
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ADDR}&format=svg&bgcolor=000000&color=FFFFFF`
    img.onload = () => {
      console.log('loaded')
      img.style.opacity = '1'
    }
    qrEl.appendChild(img)

  }
  showRefill = !showRefill
}

const setTapped = (txid) => {
  if (!txid || !txid.length) {
    return
  }
  document.querySelector('input').style.display = 'none'
  document.querySelector('.balance-container').style.display = 'none'
  let oldEl = document.querySelector('button')
  let parent = document.querySelector('.centerme')
  let link = document.createElement('a')
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
  moneyButton.render(mbDiv, {
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
  })
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
    }
    document.querySelector('.centerme').style.opacity = '1'
    return
  }
  document.querySelector('#balance').innerHTML = json.balance
  document.querySelector('.centerme').style.opacity = '1'
}

document.addEventListener("DOMContentLoaded", async () => {
  let video = document.querySelector('video')
  video.src = "framefix.m4v"
  video.oncanplay = () => {
      video.style.opacity = 1
  }
  video.load()
  let json = await updateStatus()
  updateUI(json)

  document.querySelector('button').addEventListener('click', async (e) => {
      // Update UI  was already called, so we can assume if the button exists they are untapped
      let tapAddress = document.querySelector('input').value
      // if handcash handle or bitcoin address
      if (!tapAddress) { return }
      let handcashRegex = /[\$\#][\S]*[^ .,]/
      if (handcashRegex.test(tapAddress)) {
          // lookup handcash
          try {
              let handcash = await axios.get('https://api.handcash.io/api/receivingAddress/' + tapAddress.substr(1))
              tapAddress = handcash.data.receivingAddress
          } catch (e) {
              alert('Couldn\'t get handcash address')
              return
          }
      }
      if  (tapAddress.length !== 34 || !tapAddress.startsWith('1')) {
          alert('Not a valid Bitcoin address')
          return
      }
      // Tap tap taparoo
      let resp = await tap(tapAddress)
      if (resp.error) {
          alert(resp.error)
          return
      }
      console.log('you tapped the rockies', resp)
      audio.play()
      setTapped(resp.txid)
  })
})