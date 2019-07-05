const fs = require('fs')
const path = require('path')
const openpgp = require('openpgp')

const generateKeyPair = () => {
    const options = {
        userIds: [{ name:'Any' }],
        curve: "ed25519",
        passphrase: 'nice'
    }
    
    return openpgp.generateKey(options).then((key) => {
        return {
            privateKey: key.privateKeyArmored,
            publicKey: key.publicKeyArmored
        }
    })
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

    generateKeyPair().then((keys) => {
        if(isMasterManaged) {
            if(!isBoardExists(dir, 'master')) {
                console.error('Master board does not exist, can not add master managed user')
                process.exit()
            }
    
            addEntry(dir, 'master', {
                entryName: '#' + boardName,
                loginName: '#' + boardName,
                password: keys.privateKey,
                description: '',
                tags: ''
            })
        }
        const newBoard = {
            boardName: boardName,
            publicKey: keys.publicKey,
            privateKey: keys.privateKey,
            entries: []
        }
    
        fs.writeFileSync(path.join(dir, boardName + '.board.json'), JSON.stringify(newBoard, null, 4))
    })
}

const addEntry = (dir, boardName, { entryName, loginName, password, description, tags = [] }) => {
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
            entryName: entryName, 
            loginName: loginName,
            encryptedPassword: encrypted.encryptedPassword,
            encryptedDescription: encrypted.encryptedDescription,
            tags: tags
        })
    
        fs.writeFileSync(path.join(dir, boardName + '.board.json'), JSON.stringify(board, null, 4))
    })
}

const updateEntry = (dir, boardName, { entryName, loginName, password, description, tags }) => {
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
            entryName: entryName,
            loginName: loginName || entry.loginName,
            encryptedPassword: encrypted.encryptedPassword,
            encryptedDescription: encrypted.encryptedDescription,
            tags: tags || entry.tags
        }
    
        const newEntries = board.entries.filter((entry) => {
            return entry.entryName !== entryName
        })
    
        newEntries.push(newEntry)
        board.entries = newEntries
    
        fs.writeFileSync(boardPath, JSON.stringify(board, null, 4))
    })
}

module.exports = {
    getAllBoardNames,
    isBoardExists,
    getBoard,
    addBoard,
    addEntry,
    updateEntry
}