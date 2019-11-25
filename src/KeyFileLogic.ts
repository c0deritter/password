import { KeyFile } from "./KeyFileModel"
import * as fs from 'fs'
import * as path from 'path'

export default class KeyFileLogic {
    private readonly fileExtension = 'keyFile.json'
    public keyFiles: KeyFile[]

    constructor(private dir: string) {
        this.keyFiles = this.getAllKeyFile()
    }

    private getAllKeyFile() {
        const keyFileNames = fs.readdirSync(this.dir).filter((keyFileName) => {
            return keyFileName.search(RegExp(`.*.${ this.fileExtension }$`, 'gm')) !== -1
        })
    
        const keyFiles = keyFileNames.map((keyFileName) => {
            const rawKeyFileObject = JSON.parse(fs.readFileSync(path.join(this.dir, keyFileName), { encoding: 'utf8' }))
            return new KeyFile(rawKeyFileObject.name, rawKeyFileObject.publicKey, rawKeyFileObject.encryptedPrivateKey, rawKeyFileObject.entries)  
        })

        return keyFiles
    }

    public getKeyFile(keyFileName: string) {
        return this.keyFiles.find((keyFile) => {
            return keyFile.name === keyFileName
        })
    }

    public isKeyFileExists(keyFileName: string) {
        return this.getKeyFile(keyFileName) == null ? false : true
    }

    public createKeyFile(keyFileName: string, password: string, isMasterManaged = true) {
        if(this.isKeyFileExists(keyFileName)) {
            console.error('Key file does already exist, can not add key file')
            process.exit()
        }

        return KeyFile.create(keyFileName, password).then((newKeyFile) => {
            this.saveKeyFile(newKeyFile)
            this.keyFiles.push(newKeyFile)
    
            if (isMasterManaged) {
                const masterKeyFile = this.getKeyFile('master')
    
                if(masterKeyFile == null) {
                    console.error('Master key file does not exist, can not add master managed user')
                    process.exit()
                    throw Error()
                }

                newKeyFile.unlockKeyFileByPassword(password).then(() => {
                    return masterKeyFile.addEntry({
                        entryName: keyFileName,
                        loginName: '',
                        password: newKeyFile.decryptedPrivateKey,
                        description: '',
                        link: '',
                        tags: []
                    })
                    .then(() => {
                        this.saveKeyFile(masterKeyFile)
                    })
                })  
            }

            return newKeyFile
        })
    }

    public saveKeyFile(keyfile: KeyFile) {
        fs.writeFileSync(path.join(this.dir, keyfile.name + `.${ this.fileExtension }`), JSON.stringify(keyfile, null, 4))
    }
}