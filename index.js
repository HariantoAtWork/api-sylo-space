const setuidOnNodeEnvProduction = require('./src/lib/setuidOnNodeEnvProduction')
// setuidOnNodeEnvProduction()

const app = require('./src/app')
const fs = require('fs')
const port = process.env.PORT || 3000

if (!!isNaN(port)) {
  try {
    fs.unlinkSync(port);
    console.log('successfully deleted: ' + port);
  } catch (err) {}
}

app.listen(port, () => {
  console.log('JSONPlaceholder listening on:' + (!isNaN(port) ? `http://localhost:${port}` : port))
  if (!!isNaN(port)) {
    try {
      fs.chmodSync(port, 0o777)
      console.log(`The permissions for file "${port}" have been changed!`)
    } catch (err) {
      // handle the error
      console.error(err)
    }
  }
})
