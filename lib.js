const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const openpgp = require('openpgp')

const generateKeyPair = (password) => {
    const options = {
        userIds: [{ name:'Any' }],
        curve: "ed25519",
        passphrase: password
    }
    
    return openpgp.generateKey(options)
}

const getAllBoardNames = (dir) => {
    const boardFiles = fs.readdirSync(dir).filter((boardName) => {
        return boardName.search(/.*.board.json$/gm) !== -1
    })

    const userNames = boardFiles.map((userName) => {
        return userName.replace('.board.json', '')
    })

    return userNames
}

const isBoardExists = (dir, boardName) => {
    return getAllBoardNames(dir).some((existingBoardName) => {
        return boardName === existingBoardName
    })
}

const getBoard = (dir, boardName) => {
    const boardPath = path.join(dir, boardName + '.board.json')
    return JSON.parse(fs.readFileSync(boardPath, { encoding: 'utf8' }))
}

const addBoard = (dir, boardName, password, isMasterManaged = true) => {
    if(isBoardExists(dir, boardName)) {
        console.error('Board does already exist, can not add board')
        process.exit()
    }

    
    generateKeyPair(password).then((keys) => {
        const encryptedPrivateKey = keys.privateKeyArmored

        if(isMasterManaged) {
            if(!isBoardExists(dir, 'master')) {
                console.error('Master board does not exist, can not add master managed user')
                process.exit()
            }

            keys.key.decrypt(password).then(() => {
                addEntry(dir, 'master', {
                    entryName: '#' + boardName,
                    loginName: '#' + boardName,
                    password: keys.key.armor(),
                    description: '',
                    tags: ''
                })
            })
        }

        const newBoard = {
            boardName: boardName,
            publicKey: keys.publicKey,
            privateKey: encryptedPrivateKey,
            entries: []
        }
    
        fs.writeFileSync(path.join(dir, boardName + '.board.json'), JSON.stringify(newBoard, null, 4))
    })
}

const addEntry = (dir, boardName, { entryName, loginName, password, description, link, tags = [] }) => {
    if(!isBoardExists(dir, boardName)) {
        console.error('Board does not exist, can not add entry')
    }

    const board = getBoard(dir, boardName)

    openpgp.key.readArmored(board.publicKey).then((publicKeys) => publicKeys.keys)
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
        board.entries.push({
            id:  crypto.createHash('sha512').update(crypto.randomBytes(512)).digest('base64'),
            entryName: entryName, 
            loginName: loginName,
            encryptedPassword: encrypted.encryptedPassword,
            encryptedDescription: encrypted.encryptedDescription,
            link: link,
            tags: tags
        })
    
        fs.writeFileSync(path.join(dir, boardName + '.board.json'), JSON.stringify(board, null, 4))
    })
}

const updateEntry = (dir, boardName, { entryName, loginName, password, description, link, tags }) => {
    if(!isBoardExists()) {
        console.error('Board does not exist, can not update entry')
    }

    const boardPath = path.join(dir,boardName + '.board.json')
    const board = JSON.parse(fs.readFileSync(boardPath, { encoding: 'utf8' }))

    const entry = board.entries.find((entry) => {
        entry.entryName === entryName
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
    
        const newEntries = board.entries.filter((entry) => {
            return entry.id !== id
        })
    
        newEntries.push(newEntry)
        board.entries = newEntries
    
        fs.writeFileSync(boardPath, JSON.stringify(board, null, 4))
    })
}

const getEntry = (dir, boardName, entryId, privateKeyPassword) => {
    const boardPath = path.join(dir,boardName + '.board.json')
    const board = JSON.parse(fs.readFileSync(boardPath, { encoding: 'utf8' }))

    const entry = board.entries.find((entry) => {
        return entry.id === entryId
    })

    return decrypt(board.privateKey, privateKeyPassword, entry.encryptedPassword)
    .then((password) => {
        return decrypt(board.privateKey, privateKeyPassword, entry.encryptedDescription)
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

const decrypt = (privateKey, password, encrypted) => {
    return openpgp.key.readArmored(privateKey)
    .then((privateKey) => privateKey.keys[0])
    .then((privateKeyObject) => {
        return privateKeyObject.decrypt(password)
        .then(() => privateKeyObject)
    })
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

module.exports = {
    getAllBoardNames,
    isBoardExists,
    getBoard,
    addBoard,
    addEntry,
    updateEntry,
    getEntry
}