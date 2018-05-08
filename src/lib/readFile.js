const fs = require('fs')
const readFile = (file) => new Promise((fulfil, reject) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      reject(err)
      return
    }
    fulfil(data)
  })
})

module.exports = readFile
