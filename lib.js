class Board {
    static generateKeyPair(password) {
        const options = {
            userIds: [{ name:'Any' }],
            curve: "ed25519",
            passphrase: password
        }
        
        return openpgp.generateKey(options)
    }

    static create(boardName, password) {
        return Board.generateKeyPair(password).then((keys) => {
            const encryptedPrivateKey = keys.privateKeyArmored

            return new Board(boardName, keys.publicKeyArmored, encryptedPrivateKey, [])
        })
    }

    constructor(boardName, publicKey, privateKey, entries) {
        this.boardName = boardName
        this.publicKey = publicKey
        this.privateKey = privateKey
        this.entries = entries
    }

    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    randomString(length) {
        let result = ''
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let charactersLength = characters.length
        
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }

        return result
    }

    addEntry({ entryName, loginName, password, description, link, tags = [] }) {
        return openpgp.key.readArmored(this.publicKey).then((publicKeys) => publicKeys.keys)
        .then((publicKeys) => {
            return openpgp.encrypt({
                message: openpgp.message.fromText(password),
                publicKeys: publicKeys
            })
            .then((cipher) => cipher.data)
            .then((encryptedPassword) => {
                return openpgp.encrypt({
                    message: openpgp.message.fromText(description),
                    publicKeys: publicKeys
                })
                .then(cipher => cipher.data)
                .then((encryptedDescription) => {
                    return {
                        encryptedPassword,
                        encryptedDescription
                    }
                })
            })
        })
        .then((encrypted) => {
            this.entries.push({
                id: this.randomString(40),
                entryName: entryName, 
                loginName: loginName,
                encryptedPassword: encrypted.encryptedPassword,
                encryptedDescription: encrypted.encryptedDescription,
                link: link,
                tags: tags
            })
        })
    }

    updateEntry(entryId, { entryName, loginName, password, description, link, tags }) {
        const entry = board.entries.find((entry) => {
            entry.entryId === entryId
        })
    
        if(!entry) {
            console.error('Entry does not exist, can not update entry')
        }

        new Promise((resolve) => {
            if (password) {
                openpgp.key.readArmored(keys.pubkey).then((publicKeys) => publicKeys.keys)
                .then((publicKeys) => {
                    openpgp.encrypt({
                        message: openpgp.message.fromText(password),
                        publicKeys: publicKeys
                    })
                    .then((cipher) => { resolve(cipher.data) })
                })
            } else {
                resolve(board.encryptedPassword)
            }
        }).then((encryptedPassword) => {
            if(description) {
                return openpgp.key.readArmored(keys.pubkey).then((publicKeys) => publicKeys.keys)
                .then((publicKeys) => {
                    openpgp.encrypt({
                        message: openpgp.message.fromText(description),
                        publicKeys: publicKeys
                    })
                    .then((cipher) => {
                        return {
                            encryptedPassword,
                            encryptedDescription: cipher.data
                        }
                    })
                })
            } else {
                return {
                    encryptedPassword,
                    encryptedDescription: board.encryptedDescription
                }
            }
        }).then((encrypted) => {
            const newEntry = {
                id: entry.id,
                entryName: entryName,
                loginName: loginName || entry.loginName,
                encryptedPassword: encrypted.encryptedPassword,
                encryptedDescription: encrypted.encryptedDescription,
                link: link || entry.link,
                tags: tags || entry.tags
            }
        
            const newEntries = this.entries.filter((entry) => {
                return entry.id !== id
            })
        
            newEntries.push(newEntry)
            this.entries = newEntries
        })
    }

    getAllAccessableEntries(boards, password) {
        return this.decryptPrivateKey(password)
        .then((decryptedPrivateKey) => {
            return this.decryptAllAccessableEntries(boards, decryptedPrivateKey)
        })
    }

    decryptAllAccessableEntries(boards, decryptedPrivateKey, groupEntries = []) {
        if (groupEntries.some((group) => group.boardName == this.boardName)) {
            return groupEntries
        }

        const simpleEntryPromises = this.entries.filter((entry) => {
            return !entry.entryName.match(/^#.*/)
        }).map((entry) => {
            return this.decryptEntry(decryptedPrivateKey, entry)
        })

        return Promise.all(simpleEntryPromises).then((simpleEntries) => {
            groupEntries.push({
                boardName: this.boardName,
                entries: simpleEntries
            })
        })
        .then(() => {
            const boardKeyEntries = this.entries.filter((entry) => {
                return entry.entryName.match(/^#.*/)
            })

            const decryptBoardPromises = boardKeyEntries.map((entry) => {
                const board = boards.find((board) => {
                    return board.boardName === entry.entryName.replace('#', '')
                })

                if (board != undefined) {
                    return this.decryptEntry(decryptedPrivateKey, entry)
                    .then((decrypedEntry) => {
                        return board.decryptAllAccessableEntries(boards, decrypedEntry.password, groupEntries)
                    })
                } else {
                    console.error(`Could not found shared board ${entry.entryName}`)
                }
            })

            return Promise.all(decryptBoardPromises)
        }).then(() => {
            return groupEntries
        })
    }

    decryptEntry(privateKey, entry) {
        return this.decrypt(privateKey, entry.encryptedPassword)
        .then((password) => {
            return this.decrypt(privateKey, entry.encryptedDescription)
            .then((description) => {
                return {
                    password,
                    description
                }
            })
        })
        .then((decrypted) => {
            return {
                id: entry.id,
                entryName: entry.entryName,
                loginName: entry.loginName,
                password: decrypted.password,
                description: decrypted.description,
                link: entry.link,
                tags: entry.tags
            }
        })
    }

    decryptPrivateKey(password) {
        return openpgp.key.readArmored(this.privateKey)
        .then((privateKey) => privateKey.keys[0])
        .then((privateKeyObject) => {
            return privateKeyObject.decrypt(password)
            .then(() => privateKeyObject.armor())
            .then((privateKeyArmored) => {
                return privateKeyArmored
            })
        })
    }

    decrypt(privateKey, encrypted) {
        return openpgp.key.readArmored(privateKey)
        .then((privateKeyObjects) => privateKeyObjects.keys[0])
        .then((privateKeyObject) => {
            return openpgp.message.readArmored(encrypted)
            .then((encryptedMessage) => {
                return openpgp.decrypt({
                    message: encryptedMessage,
                    privateKeys: [privateKeyObject]
                })
            })
            .then((result) => result.data)
        })
    }

    shareBoardKey(password, destinationBoard) {
        return this.decryptPrivateKey(password)
        .then((decryptedPrivateKey) => {
            return destinationBoard.addEntry({
                entryName: `#${this.boardName}`,
                loginName: `#${this.boardName}`,
                password: decryptedPrivateKey,
                description: '',
                link: '',
                tags: ''
            })
        })
    }
}

module.exports = {
    Board
}