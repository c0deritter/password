import express, { Express } from 'express'
import KeyFileLogic from '../KeyFileLogic'
import fs from 'fs'

class Server {
    private app: Express = express()

    public init() {
        this.app.get('/keyFile/:keyFileName', (req, res) => {
            let keyFileLogic = new KeyFileLogic('keyFiles')
            let keyFile = keyFileLogic.getKeyFile(req.params.keyFileName)

            if(keyFile == null) {
                res.status(404)
            } else {
                res.send(keyFile.toJSON())
            }
            res.end()
        })

        this.app.get('/', ( _ , res) => {
            let indexHtml = fs.readFileSync('built/browser/index.html', { encoding: 'utf8' })

            res.contentType('html')
            res.send(indexHtml)
            res.end()
        })

        this.app.listen(3333)
    }
}

(new Server).init()