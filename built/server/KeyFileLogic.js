"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const KeyFileModel_1 = require("./KeyFileModel");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KeyFileLogic {
    constructor(dir) {
        this.dir = dir;
        this.fileExtension = 'keyFile.json';
        this.keyFiles = this.getAllKeyFile();
    }
    getAllKeyFile() {
        const keyFileNames = fs.readdirSync(this.dir).filter((keyFileName) => {
            return keyFileName.search(RegExp(`.*.${this.fileExtension}$`, 'gm')) !== -1;
        });
        const keyFiles = keyFileNames.map((keyFileName) => {
            const rawKeyFileObject = JSON.parse(fs.readFileSync(path.join(this.dir, keyFileName), { encoding: 'utf8' }));
            return new KeyFileModel_1.KeyFile(rawKeyFileObject.name, rawKeyFileObject.publicKey, rawKeyFileObject.encryptedPrivateKey, rawKeyFileObject.entries);
        });
        return keyFiles;
    }
    getKeyFile(keyFileName) {
        return this.keyFiles.find((keyFile) => {
            return keyFile.name === keyFileName;
        });
    }
    isKeyFileExists(keyFileName) {
        return this.getKeyFile(keyFileName) == null ? false : true;
    }
    createKeyFile(keyFileName, password, isMasterManaged = true) {
        if (this.isKeyFileExists(keyFileName)) {
            console.error('Key file does already exist, can not add key file');
            process.exit();
        }
        return KeyFileModel_1.KeyFile.create(keyFileName, password).then((newKeyFile) => {
            this.saveKeyFile(newKeyFile);
            this.keyFiles.push(newKeyFile);
            if (isMasterManaged) {
                const masterKeyFile = this.getKeyFile('master');
                if (masterKeyFile == null) {
                    console.error('Master key file does not exist, can not add master managed user');
                    process.exit();
                    throw Error();
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
                        this.saveKeyFile(masterKeyFile);
                    });
                });
            }
            return newKeyFile;
        });
    }
    saveKeyFile(keyfile) {
        fs.writeFileSync(path.join(this.dir, keyfile.name + `.${this.fileExtension}`), JSON.stringify(keyfile, null, 4));
    }
}
exports.default = KeyFileLogic;
//# sourceMappingURL=KeyFileLogic.js.map