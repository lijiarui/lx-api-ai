const LUISClient = require('./luis_sdk')

const APPID = '1156707f-da5a-48f6-9f7d-1c99c1f04f01'
const APPKEY = '7dbf6405b5154fbca1a8cce9363feab8'

const QrcodeTerminal  = require('qrcode-terminal')
const finis           = require('finis')

import {
  Config,
  Wechaty,
  log,
  MediaMessage,
  Contact,
  Message,
  MsgType
} from 'wechaty'

const bot = Wechaty.instance({ profile: 'lx' })

interface Entity {
  entity:      string,
  type:        string,
  startIndex?:  number,
  endIndex?:    number,
}

let entityArray: Entity[] = []

let to_place = {}
let from_place = {}
let time = {}

const to_place_entity = ['to_place']
const from_place_entity = ['from_place']
const time_entity = ['to_date', 'to_time_period', 'to_time', 'from_time_period', 'from_date', 'from_time', 'priority_time']

bot
.on('logout'	, user => log.info('Bot', `${user.name()} logouted`))
.on('login'	  , user => {
  log.info('Bot', `${user.name()} logined`)
  bot.say('Wechaty login')
})
.on('error'   , e => {
  log.info('Bot', 'error: %s', e)
  bot.say('Wechaty error: ' + e.message)
})
.on('scan', (url, code) => {
  if (!/201|200/.test(String(code))) {
    let loginUrl = url.replace(/\/qrcode\//, '/l/')
    QrcodeTerminal.generate(loginUrl)
  }
  console.log(`${url}\n[${code}] Scan QR Code in above url to login: `)
})
.on('message', async m => {
  try {
    if (m.self() || m.type() !== MsgType.TEXT) {
      return
    }
    const response = await luis(m)
  } catch (e) {
    log.error('Bot', 'on(message) exception: %s' , e)
  }
})

bot.init()
.catch(e => {
  log.error('Bot', 'init() fail: %s', e)
  bot.quit()
  process.exit(-1)
})

var LUISclient = LUISClient({
    appId: APPID,
    appKey: APPKEY,
    verbose: true
})

async function luis(message: Message) {
  const content = message.content()
  const contact = message.from()

  LUISclient.predict(content, {

      //On success of prediction
      onSuccess: function(response) {
          printOnSuccess(contact, response)
      },

      //On failure of prediction
      onFailure: function(err) {
          console.error(err)
      }
  })
}

const printOnSuccess = function(contact, response) {
    console.log('Query: ' + response.query)
    console.log('Top Intent: ' + response.topScoringIntent.intent)
    console.log('Entities:')
    console.log(response)
    for (var i = 1; i <= response.entities.length; i++) {
        entityArray.push(response.entities[i - 1])
        console.log('Entity: ' + response.entities[i - 1].type + '- ' + response.entities[i - 1].entity)
    }
    if (typeof response.dialog !== 'undefined' && response.dialog !== null) {
        console.log('Dialog Status: ' + response.dialog.status)
        if (!response.dialog.isFinished()) {
            console.log('Dialog Parameter Name: ' + response.dialog.parameterName)
            console.log('Dialog Prompt: ' + response.dialog.prompt)
        }
    }
    checkEntity(contact)
}

function checkEntity(contact: Contact) {
  if (entityArray.length === 0) {
    contact.say('你要去哪里呢')
    return
  }
  if (!checkToPlaceEntity()) {
    contact.say('你要去哪里呢')
    return
  }
  if (!checkFromPlaceEntity()) {
    contact.say('你要从哪里出发呢')
    return
  }
  if (!checkTimeEntity()) {
    contact.say('什么时候出发呢')
    return
  }
  let reply = ''
  for (let i = 0; i < entityArray.length; i++) {
    reply = reply + entityArray[i].type + ": " + entityArray[i].entity + ', '
  }
  contact.say('信息收集完毕：' + reply + '对么？')
  entityArray = []
}

function checkToPlaceEntity(): Boolean {
  for (let i = 0; i < entityArray.length; i++) {
    if (to_place_entity.indexOf(entityArray[i].type) > -1) {
      console.log('get to_place_entity:')
      console.log(entityArray[i])
      return true
    }
  }
  return false
}

function checkFromPlaceEntity(): Boolean {
  for (let i = 0; i < entityArray.length; i++) {
    if (from_place_entity.indexOf(entityArray[i].type) > -1) {
      console.log('get from_place_entity:')
      console.log(entityArray[i])
      return true
    }
  }
  return false
}

function checkTimeEntity(): Boolean {
  for (let i = 0; i < entityArray.length; i++) {
    if (time_entity.indexOf(entityArray[i].type) > -1) {
      console.log('get time_entity:')
      console.log(entityArray[i])
      return true
    }
  }
  return false
}