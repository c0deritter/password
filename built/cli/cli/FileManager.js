"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var FileManager = /** @class */ (function () {
    function FileManager(dir) {
        this.dir = dir;
        this.fileExtension = 'keyFile.json';
        this.keyFiles = this.getAllKeyFile();
    }
    FileManager.prototype.getAllKeyFile = function () {
        var _this = this;
        var keyFileNames = fs_1.default.readdirSync(this.dir).filter(function (keyFileName) {
            return keyFileName.search(RegExp(".*." + _this.fileExtension + "$", 'gm')) !== -1;
        });
        var keyFiles = keyFileNames.map(function (keyFileName) {
            var rawKeyFileObject = JSON.parse(fs_1.default.readFileSync(path_1.default.join(_this.dir, keyFileName), { encoding: 'utf8' }));
            return new lib_1.KeyFile(rawKeyFileObject.name, rawKeyFileObject.publicKey, rawKeyFileObject.encryptedPrivateKey, rawKeyFileObject.entries);
        });
        return keyFiles;
    };
    FileManager.prototype.getKeyFile = function (keyFileName) {
        return this.keyFiles.find(function (keyFile) {
            return keyFile.name === keyFileName;
        });
    };
    FileManager.prototype.isKeyFileExists = function (keyFileName) {
        return this.getKeyFile(keyFileName) == null ? false : true;
    };
    FileManager.prototype.createKeyFile = function (keyFileName, password, isMasterManaged) {
        var _this = this;
        if (isMasterManaged === void 0) { isMasterManaged = true; }
        if (this.isKeyFileExists(keyFileName)) {
            console.error('Key file does already exist, can not add key file');
            process.exit();
        }
        return lib_1.KeyFile.create(keyFileName, password).then(function (newKeyFile) {
            _this.saveKeyFile(newKeyFile);
            _this.keyFiles.push(newKeyFile);
            if (isMasterManaged) {
                var masterKeyFile_1 = _this.getKeyFile('master');
                if (masterKeyFile_1 == null) {
                    console.error('Master key file does not exist, can not add master managed user');
                    process.exit();
                    throw Error();
                }
                newKeyFile.unlockKeyFileByPassword(password).then(function () {
                    return masterKeyFile_1.addEntry({
                        entryName: keyFileName,
                        loginName: '',
                        password: newKeyFile.decryptedPrivateKey,
                        description: '',
                        link: '',
                        tags: []
                    })
                        .then(function () {
                        _this.saveKeyFile(masterKeyFile_1);
                    });
                });
            }
            return newKeyFile;
        });
    };
    FileManager.prototype.saveKeyFile = function (keyfile) {
        fs_1.default.writeFileSync(path_1.default.join(this.dir, keyfile.name + ("." + this.fileExtension)), JSON.stringify(keyfile, null, 4));
    };
    return FileManager;
}());
exports.default = FileManager;
//# sourceMappingURL=FileManager.js.map