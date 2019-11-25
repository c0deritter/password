"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const openpgp = __importStar(require("openpgp"));
class KeyFile {
    constructor(name, publicKey, encryptedPrivateKey, entries) {
        this.name = name;
        this.publicKey = publicKey;
        this.encryptedPrivateKey = encryptedPrivateKey;
        this.entries = entries;
        this.decryptedPrivateKey = '';
        this.isLocked = true;
    }
    static generateKeyPair(password) {
        const options = {
            userIds: [{ name: 'Any' }],
            curve: "ed25519",
            passphrase: password
        };
        return openpgp.generateKey(options);
    }
    static create(keyFileName, password) {
        return this.generateKeyPair(password).then((keys) => {
            const encryptedPrivateKey = keys.privateKeyArmored;
            return new this(keyFileName, keys.publicKeyArmored, encryptedPrivateKey, []);
        });
    }
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    randomString(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    addEntry({ entryName, loginName, password, description, link, tags = [] }) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicKeys = yield openpgp.key.readArmored(this.publicKey).then((publicKeys) => publicKeys.keys);
            const { data: encryptedPassword } = yield openpgp.encrypt({
                message: openpgp.message.fromText(password),
                publicKeys: publicKeys
            });
            const { data: encryptedDescription } = yield openpgp.encrypt({
                message: openpgp.message.fromText(description),
                publicKeys: publicKeys
            });
            this.entries.push({
                id: this.randomString(40),
                entryName: entryName,
                loginName: loginName,
                encryptedPassword: encryptedPassword,
                encryptedDescription: encryptedDescription,
                link: link,
                tags: tags
            });
        });
    }
    updateEntry(entryId, { entryName, loginName, password, description, link, tags }) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = this.entries.find((entry) => {
                entry.id === entryId;
            });
            if (!entry) {
                throw new Error('Entry does not exist, can not update entry');
            }
            let encryptedPassword = entry.encryptedPassword;
            let encryptedDescription = entry.encryptedDescription;
            if (password != undefined || description != undefined) {
                const publicKeys = yield openpgp.key.readArmored(this.publicKey).then((publicKeys) => publicKeys.keys);
                if (password != undefined) {
                    ({ data: encryptedPassword } = yield openpgp.encrypt({
                        message: openpgp.message.fromText(password),
                        publicKeys: publicKeys
                    }));
                }
                if (description != undefined) {
                    ({ data: encryptedDescription } = yield openpgp.encrypt({
                        message: openpgp.message.fromText(description),
                        publicKeys: publicKeys
                    }));
                }
            }
            this.entries = this.entries.filter((filteredEntry) => filteredEntry !== entry);
            const newEntry = {
                id: entry.id,
                entryName: entryName != undefined ? entryName : entry.entryName,
                loginName: loginName != undefined ? loginName : entry.loginName,
                encryptedPassword: encryptedPassword,
                encryptedDescription: encryptedDescription,
                link: link != undefined ? link : entry.link,
                tags: tags != undefined ? tags : entry.tags
            };
            this.entries.push(newEntry);
        });
    }
    unlockKeyFileByPrivateKey(decrypetedPrivateKey) {
        this.decryptedPrivateKey = decrypetedPrivateKey;
        this.isLocked = false;
    }
    unlockKeyFileByPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keys: [privateKeyObject] } = yield openpgp.key.readArmored(this.encryptedPrivateKey);
            yield privateKeyObject.decrypt(password);
            this.decryptedPrivateKey = privateKeyObject.armor();
            this.isLocked = false;
        });
    }
    decryptEntry(entryId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isLocked === true) {
                throw new Error(`Can not decrypt entry because this key file(${this.name}) is locked`);
            }
            const entry = this.entries.find((entry) => entry.id === entryId);
            if (entry == undefined) {
                throw new Error(`Can not decrypt entry because entry id(${entryId}) not found`);
            }
            const password = yield this.decrypt(entry.encryptedPassword);
            const description = yield this.decrypt(entry.encryptedDescription);
            return {
                id: entry.id,
                entryName: entry.entryName,
                loginName: entry.loginName,
                password: password,
                description: description,
                link: entry.link,
                tags: entry.tags
            };
        });
    }
    decrypt(encrypted) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keys: [privateKeyObject] } = yield openpgp.key.readArmored(this.decryptedPrivateKey);
            const encryptedMessage = yield openpgp.message.readArmored(encrypted);
            const { data: decrypted } = yield openpgp.decrypt({
                message: encryptedMessage,
                privateKeys: [privateKeyObject]
            });
            return decrypted;
        });
    }
    updatePrivateKey(decryptedPrivateKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keys: [privateKeyObject] } = yield openpgp.key.readArmored(decryptedPrivateKey);
            yield privateKeyObject.encrypt(password);
            this.encryptedPrivateKey = privateKeyObject.armor();
        });
    }
    shareEntry(entryId, userSafe) {
        return __awaiter(this, void 0, void 0, function* () {
            const decryptEntry = yield this.decryptEntry(entryId);
            yield userSafe.addEntry(decryptEntry);
        });
    }
    toJSON() {
        return {
            name: this.name,
            publicKey: this.publicKey,
            encryptedPrivateKey: this.encryptedPrivateKey,
            entries: this.entries
        };
    }
}
exports.KeyFile = KeyFile;
//# sourceMappingURL=KeyFileModel.js.map