var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../lib", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var lib_1 = require("../lib");
    var fs = __importStar(require("fs"));
    var path = __importStar(require("path"));
    var FileManager = /** @class */ (function () {
        function FileManager(dir) {
            this.dir = dir;
            this.fileExtension = 'keyFile.json';
            this.keyFiles = this.getAllKeyFile();
        }
        FileManager.prototype.getAllKeyFile = function () {
            var _this = this;
            var keyFileNames = fs.readdirSync(this.dir).filter(function (keyFileName) {
                return keyFileName.search(RegExp(".*." + _this.fileExtension + "$", 'gm')) !== -1;
            });
            var keyFiles = keyFileNames.map(function (keyFileName) {
                var rawKeyFileObject = JSON.parse(fs.readFileSync(path.join(_this.dir, keyFileName), { encoding: 'utf8' }));
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
            fs.writeFileSync(path.join(this.dir, keyfile.name + ("." + this.fileExtension)), JSON.stringify(keyfile, null, 4));
        };
        return FileManager;
    }());
    exports.default = FileManager;
});
//# sourceMappingURL=FileManager.js.map