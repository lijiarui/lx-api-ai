const QrcodeTerminal  = require('qrcode-terminal')
const finis           = require('finis')

import {
  Config,
  Wechaty,
  log,
  MediaMessage,
  MsgType
} from 'wechaty'

const bot = Wechaty.instance({ profile: 'lx' })

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
    const response = await apiAi(m.content())
    const result = response['result']
    if (result['metadata'] && result['parameters']) {
      await m.say('intent:' + result['metadata']['intentName'])
      
      for (let i in result['parameters']) {
        if (result['parameters'][i]) {
          await m.say('获取参数：' + i + '--' + result['parameters'][i])
        }
      }
    } else {
      await m.say('你说什么，我听不懂')
    }
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

finis((code, signal) => {
  const exitMsg = `Wechaty exit ${code} because of ${signal} `
  console.log(exitMsg)
  bot.say(exitMsg)
})

async function apiAi(content: string) {
  const apiai = require('apiai')
  const app = apiai('c223b2fd6ce64df993e85311f2eaf394')
  return new Promise<void>((resolve, reject) => {
    const request = app.textRequest(content, {
      sessionId: '1234567899'
    })
    request.once('response', function(response) {
      console.log(response)
      resolve(response)
    })
    request.once('error', function(error) {
      reject(error)
      console.log(error)
    })
    request.end()
  })
}