const fs = require('fs')
const uuid = require('uuid/v1')

const filename = 'chat.txt'
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err

  console.log('OK' + filename)
  const array = data.split(`\n`)
  let intent = {}
  intent['id'] = uuid()
  intent['name'] = 'flight_book'
  intent['auto'] = true
  intent['contexts'] = []
  intent['templates'] = []
  intent['userSays'] = array.map(function(element) {
    let userSay = {}
    userSay['id'] = uuid()
    userSay['data'] = [{text: element}]
    return userSay
  })

  fs.writeFile ('intent-flight-book.json', JSON.stringify(intent), function(err){
    if (err) {
      throw Error(err)
    }

    console.log("The file was saved")
    console.log(intent)
  })
})