#!/usr/bin/env node
import * as openpgp from 'openpgp'

interface Entry {
    entryName: string, 
    loginName: string,
    link: string,
    tags: string[]
}

export interface DecryptedEntry extends Entry {
    password: string
    description: string
}

export interface EncryptedEntry extends Entry {
    id: string,
    encryptedPassword: string,
    encryptedDescription: string
}

export class KeyFile {
    private static generateKeyPair(password: string) {
        const options = {
            userIds: [{ name:'Any' }],
            curve: "ed25519",
            passphrase: password
        }
        
        return openpgp.generateKey(options)
    }

    public static create(keyFileName: string, password: string) {
        return this.generateKeyPair(password).then((keys) => {
            const encryptedPrivateKey = keys.privateKeyArmored

            return new this(keyFileName, keys.publicKeyArmored, encryptedPrivateKey, [])
        })
    }

    public decryptedPrivateKey = ''
    public isLocked = true

    constructor(public name: string, public publicKey: string, public encryptedPrivateKey: string, public entries: EncryptedEntry[]) {}

    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    private randomString(length: number) {
        let result = ''
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let charactersLength = characters.length
        
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }

        return result
    }

    public async addEntry({ entryName, loginName, password, description, link, tags = [] }: DecryptedEntry) {
        const publicKeys = await openpgp.key.readArmored(this.publicKey).then((publicKeys) => publicKeys.keys)
        
        const { data: encryptedPassword } = await openpgp.encrypt({
            message: openpgp.message.fromText(password),
            publicKeys: publicKeys
        })
        const { data: encryptedDescription } = await openpgp.encrypt({
            message: openpgp.message.fromText(description),
            publicKeys: publicKeys
        })

        this.entries.push({
            id: this.randomString(40),
            entryName: entryName, 
            loginName: loginName,
            encryptedPassword: encryptedPassword,
            encryptedDescription: encryptedDescription,
            link: link,
            tags: tags
        })
    }

    public async updateEntry(entryId: string, { entryName, loginName, password, description, link, tags }: DecryptedEntry) {        
        const entry = this.entries.find((entry) => {
            entry.id === entryId
        })
    
        if(!entry) {
            throw new Error('Entry does not exist, can not update entry')
        }

        let encryptedPassword = entry.encryptedPassword
        let encryptedDescription = entry.encryptedDescription

        if (password != undefined || description != undefined) {

            const publicKeys = await openpgp.key.readArmored(this.publicKey).then((publicKeys) => publicKeys.keys)
    
            if (password != undefined) {
                ({ data: encryptedPassword } = await openpgp.encrypt({
                    message: openpgp.message.fromText(password),
                    publicKeys: publicKeys
                }))
            }
    
            if (description != undefined) {
                ({ data: encryptedDescription } = await openpgp.encrypt({
                    message: openpgp.message.fromText(description),
                    publicKeys: publicKeys
                }))
            }
        }

        this.entries = this.entries.filter((filteredEntry) => filteredEntry !== entry)

        const newEntry: EncryptedEntry = {
            id: entry.id,
            entryName: entryName != undefined ? entryName : entry.entryName,
            loginName: loginName != undefined ? loginName : entry.loginName,
            encryptedPassword: encryptedPassword,
            encryptedDescription: encryptedDescription,
            link: link != undefined ? link : entry.link,
            tags: tags != undefined ? tags : entry.tags
        }

        this.entries.push(newEntry)
    }

    public unlockKeyFileByPrivateKey(decrypetedPrivateKey: string) {
        this.decryptedPrivateKey = decrypetedPrivateKey
        this.isLocked = false
    }

    public async unlockKeyFileByPassword(password: string) {
        const { keys: [ privateKeyObject ] } = <{ keys: openpgp.key.Key[] }>await openpgp.key.readArmored(this.encryptedPrivateKey)
        await privateKeyObject.decrypt(password)
        this.decryptedPrivateKey = privateKeyObject.armor()
        this.isLocked = false
    }

    public async decryptEntry(entryId: string) {
        if (this.isLocked === true) {
            throw new Error(`Can not decrypt entry because this key file(${this.name}) is locked`)
        }

        const entry = this.entries.find((entry) => entry.id === entryId)

        if (entry == undefined) {
            throw new Error(`Can not decrypt entry because entry id(${entryId}) not found`)
        }

        const password = await this.decrypt(entry.encryptedPassword)
        const description = await this.decrypt(entry.encryptedDescription)

        return {
            id: entry.id,
            entryName: entry.entryName,
            loginName: entry.loginName,
            password: password,
            description: description,
            link: entry.link,
            tags: entry.tags
        }
    }

    private async decrypt(encrypted: string) {
        const { keys: [privateKeyObject]} = await openpgp.key.readArmored(this.decryptedPrivateKey)
        const encryptedMessage = await openpgp.message.readArmored(encrypted)

        const { data: decrypted } = <{ data: string }>await openpgp.decrypt({
            message: encryptedMessage,
            privateKeys: [privateKeyObject]
        })

        return decrypted
    }

    public async updatePrivateKey(decryptedPrivateKey: string, password: string) {
        const { keys: [privateKeyObject] } = await openpgp.key.readArmored(decryptedPrivateKey)
        await privateKeyObject.encrypt(password)
        this.encryptedPrivateKey = privateKeyObject.armor()
    }

    public async shareEntry(entryId: string, userSafe: KeyFile) {
        const decryptEntry = await this.decryptEntry(entryId)
        await userSafe.addEntry(decryptEntry)
    }

    public toJSON() {
        return {
            name: this.name,
            publicKey: this.publicKey,
            encryptedPrivateKey: this.encryptedPrivateKey,
            entries: this.entries
        }
    }
}