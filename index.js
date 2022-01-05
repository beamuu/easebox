const express = require('express')
const crypto = require('crypto')
const colors = require('colors')
const app = express()
const PORT = 6727

const { wallet } = require('./wallet') 

// controllers
const ping = require('./controllers/ping')
const root = require('./controllers/root')
const { setACODE, authMiddleWare} = require('./middlewares/auth')

setACODE(initAuthenticationCode());
app.use(express.json())

wallet.preloadDatabase()


app.get('/ping', ping)
app.get('/', root)
app.post('/account', authMiddleWare, (req,res) => res.send('yay'))

app.listen(PORT, () => console.log('Easebox started, your box IP is', colors.green(`http://127.0.0.1:${PORT}`)))

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function initAuthenticationCode() {
    return makeid(15);
}