const { db } = require('./database')
const ethers = require('ethers')
const prompt = require('prompt-sync')({ sigint: true })
const colors = require('colors')
const crypto = require('crypto')

const { getACODE } = require('./middlewares/auth')


let PWD

const multiLinePrompt = ask => {
    const lines = ask.split(/\r?\n/);
    const promptLine = lines.pop();
    console.log(lines.join('\n'));
    return prompt(promptLine);
};

function sha256(i) {
    return crypto.createHash('sha256').update(i).digest('hex')
}


class Wallet {

    walletExisted = 0
    status = 0

    static account = null

    async #initDatabase() {
        const p = prompt('Set up your Easebox password: ')
        const confp = prompt('Confirm password: ')
        const hashedPwd = sha256(p)
        if (confp === p) {
            await db.put('pwd', hashedPwd).then(() => console.log('[*] Password set!'))
            await db.put('init', 1).then(() => console.log('[*] Easebox initialized.'))
            await db.put('walletCheck', 0)
            this.status = 1
            return
        }
        else {
            throw new Error('Password not match')
        }
    }
    async preloadDatabase() {

        var init
        try {
            init = await db.get('init')
            if (!init) throw new Error('Unknown initialized code.')
            else {
                await this.#authenticate()
                await this.#walletCheck()
            }
        }
        catch (err) {
            await this.#initDatabase()
            await this.#walletCheck()
            this.status = 1
        }        
    }
    async #walletCheck() {
        const walletCheck = await db.get('walletCheck').catch(() => console.log('[X] Fail to initialized wallet'))
            switch (walletCheck) {
                case 0:
                    this.#promptInitWallet()
                    break;
                case 1:
                    break;
            }
    }

    async #authenticate() {
        const storedPwd = await db.get('pwd')
        const input = prompt('Password: ')
        const hashedInput = sha256(input)
        if (storedPwd !== hashedInput) {
            console.log(colors.black.bgRed('!! Password not match !!'))
            process.exit()
        }
        PWD = input
        return 
    }

    #newAccount() {

        const _n = ethers.Wallet.createRandom()

        // put in to db with an encryption

        console.log()
        console.log('We have created your new account!')
        console.log(`  [address]: ${colors.cyan(_n.address)}`)
        console.log(`  [mnemonic phrase]: ${colors.yellow(_n._mnemonic().phrase)}`)
        console.log()
        console.log(colors.red(' == Attention, please read =='))
        console.log()
        console.log(colors.green('Please write down your mnemonic phrase in a physical paper. We recommended you not to keep your mnemonic phrase in a digital data such as copied text or stored in notes application.'))
        console.log()
        console.log(colors.green('We will securely store your private key in your local machine with our encryption. Your private key will not be publish across the network. Do not share the access code to others. The access code will be reset everytime the application is restarted.'))
        console.log()
        console.log('Welcome', colors.black.bgCyan(_n.address))
        console.log('Access code is', colors.yellow(getACODE()))
        console.log()
    }


    #initAccountFromMnemonic() {
        const mp = prompt("Enter your mnemonic phrase: ")
        var _n
        try {
            _n = ethers.Wallet.fromMnemonic(mp)
            console.log(_n)
            console.log(_n._mnemonic())

        } catch (err) {
            throw new Error(err)
        }
    }


    #loadAccountFromPrivateKey() {
        
    }


    #promptInitWallet() {

        console.log()
        console.log()
        console.log('[*] !! Please finish setup before connecting with Ease wallet website.')
        var ask = multiLinePrompt("Create new wallet by these available options:\n[1] New empty wallet\n[2] Import from mnemonic phrase\n[3] Import from private key (0x...)\n\nchoose the number (1-3), type and press enter\n")
        console.log('Option', ask, 'selected.')
        try {
            ask = parseInt(ask)
        } catch (error) {
            throw new Error(error)
        }
        switch (ask) {
            case 1:
                this.#newAccount()
                break;
            case 2:
                this.#initAccountFromMnemonic()
                break;
            case 3:
                break;
            default:
                throw new Error('Option out of range.')
        }

    }
}

const wallet = new Wallet()
exports.wallet = wallet


