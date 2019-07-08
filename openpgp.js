const openpgp = require('openpgp')

const options = {
    userIds: [{ name:'Any' }],
    curve: "ed25519",
    passphrase: 'nice'
}

openpgp.generateKey(options).then((key) => {
    return {
        privkey: key.privateKeyArmored,
        pubkey: key.publicKeyArmored
    }
}).then((keys) => {
    openpgp.key.readArmored(keys.pubkey).then((publicKeys) => publicKeys.keys)
    .then((publicKeys) => {
        return openpgp.encrypt({
            message: openpgp.message.fromText('Hello, World!'),
            publicKeys: publicKeys
        })
    })
    .then((ciphertext) => ciphertext.data)
    .then((ciphertext) => {
        openpgp.key.readArmored(keys.privkey).then((privkey) => privkey.keys[0])
        .then((privkeyObject) => {
            return privkeyObject.decrypt('nice').then(() => privkeyObject)
        })
        .then((privkeyObject) => privkeyObject.armor())
        .then((decryptedPrivkey) => {
            return openpgp.key.readArmored(decryptedPrivkey).then((privkey) => privkey.keys[0])
        })
        .then((privkeyObject) => {
            return openpgp.message.readArmored(ciphertext).then((cipherMessage) => {
                return {
                    privkeyObject,
                    cipherMessage
                }
            })
        })
        .then((decryptObject) => {
            openpgp.decrypt({
                message: decryptObject.cipherMessage,
                privateKeys: [decryptObject.privkeyObject]
            }).then((text) => {
                console.log(text.data)
            })
        })
    })
})
