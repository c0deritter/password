#!/usr/bin/env node
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var openpgp = __importStar(require("openpgp"));
var KeyFile = /** @class */ (function () {
    function KeyFile(name, publicKey, encryptedPrivateKey, entries) {
        this.name = name;
        this.publicKey = publicKey;
        this.encryptedPrivateKey = encryptedPrivateKey;
        this.entries = entries;
        this.decryptedPrivateKey = '';
        this.isLocked = true;
    }
    KeyFile.generateKeyPair = function (password) {
        var options = {
            userIds: [{ name: 'Any' }],
            curve: "ed25519",
            passphrase: password
        };
        return openpgp.generateKey(options);
    };
    KeyFile.create = function (keyFileName, password) {
        var _this = this;
        return this.generateKeyPair(password).then(function (keys) {
            var encryptedPrivateKey = keys.privateKeyArmored;
            return new _this(keyFileName, keys.publicKeyArmored, encryptedPrivateKey, []);
        });
    };
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    KeyFile.prototype.randomString = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    KeyFile.prototype.addEntry = function (_a) {
        var entryName = _a.entryName, loginName = _a.loginName, password = _a.password, description = _a.description, link = _a.link, _b = _a.tags, tags = _b === void 0 ? [] : _b;
        return __awaiter(this, void 0, void 0, function () {
            var publicKeys, encryptedPassword, encryptedDescription;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, openpgp.key.readArmored(this.publicKey).then(function (publicKeys) { return publicKeys.keys; })];
                    case 1:
                        publicKeys = _c.sent();
                        return [4 /*yield*/, openpgp.encrypt({
                                message: openpgp.message.fromText(password),
                                publicKeys: publicKeys
                            })];
                    case 2:
                        encryptedPassword = (_c.sent()).data;
                        return [4 /*yield*/, openpgp.encrypt({
                                message: openpgp.message.fromText(description),
                                publicKeys: publicKeys
                            })];
                    case 3:
                        encryptedDescription = (_c.sent()).data;
                        this.entries.push({
                            id: this.randomString(40),
                            entryName: entryName,
                            loginName: loginName,
                            encryptedPassword: encryptedPassword,
                            encryptedDescription: encryptedDescription,
                            link: link,
                            tags: tags
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    KeyFile.prototype.updateEntry = function (entryId, _a) {
        var entryName = _a.entryName, loginName = _a.loginName, password = _a.password, description = _a.description, link = _a.link, tags = _a.tags;
        return __awaiter(this, void 0, void 0, function () {
            var entry, encryptedPassword, encryptedDescription, publicKeys, newEntry;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        entry = this.entries.find(function (entry) {
                            entry.id === entryId;
                        });
                        if (!entry) {
                            throw new Error('Entry does not exist, can not update entry');
                        }
                        encryptedPassword = entry.encryptedPassword;
                        encryptedDescription = entry.encryptedDescription;
                        if (!(password != undefined || description != undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, openpgp.key.readArmored(this.publicKey).then(function (publicKeys) { return publicKeys.keys; })];
                    case 1:
                        publicKeys = _b.sent();
                        if (!(password != undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, openpgp.encrypt({
                                message: openpgp.message.fromText(password),
                                publicKeys: publicKeys
                            })];
                    case 2:
                        (encryptedPassword = (_b.sent()).data);
                        _b.label = 3;
                    case 3:
                        if (!(description != undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, openpgp.encrypt({
                                message: openpgp.message.fromText(description),
                                publicKeys: publicKeys
                            })];
                    case 4:
                        (encryptedDescription = (_b.sent()).data);
                        _b.label = 5;
                    case 5:
                        this.entries = this.entries.filter(function (filteredEntry) { return filteredEntry !== entry; });
                        newEntry = {
                            id: entry.id,
                            entryName: entryName != undefined ? entryName : entry.entryName,
                            loginName: loginName != undefined ? loginName : entry.loginName,
                            encryptedPassword: encryptedPassword,
                            encryptedDescription: encryptedDescription,
                            link: link != undefined ? link : entry.link,
                            tags: tags != undefined ? tags : entry.tags
                        };
                        this.entries.push(newEntry);
                        return [2 /*return*/];
                }
            });
        });
    };
    KeyFile.prototype.unlockKeyFileByPrivateKey = function (decrypetedPrivateKey) {
        this.decryptedPrivateKey = decrypetedPrivateKey;
        this.isLocked = false;
    };
    KeyFile.prototype.unlockKeyFileByPassword = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var privateKeyObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, openpgp.key.readArmored(this.encryptedPrivateKey)];
                    case 1:
                        privateKeyObject = (_a.sent()).keys[0];
                        return [4 /*yield*/, privateKeyObject.decrypt(password)];
                    case 2:
                        _a.sent();
                        this.decryptedPrivateKey = privateKeyObject.armor();
                        this.isLocked = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    KeyFile.prototype.decryptEntry = function (entryId) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, password, description;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isLocked === true) {
                            throw new Error("Can not decrypt entry because this key file(" + this.name + ") is locked");
                        }
                        entry = this.entries.find(function (entry) { return entry.id === entryId; });
                        if (entry == undefined) {
                            throw new Error("Can not decrypt entry because entry id(" + entryId + ") not found");
                        }
                        return [4 /*yield*/, this.decrypt(entry.encryptedPassword)];
                    case 1:
                        password = _a.sent();
                        return [4 /*yield*/, this.decrypt(entry.encryptedDescription)];
                    case 2:
                        description = _a.sent();
                        return [2 /*return*/, {
                                id: entry.id,
                                entryName: entry.entryName,
                                loginName: entry.loginName,
                                password: password,
                                description: description,
                                link: entry.link,
                                tags: entry.tags
                            }];
                }
            });
        });
    };
    KeyFile.prototype.decrypt = function (encrypted) {
        return __awaiter(this, void 0, void 0, function () {
            var privateKeyObject, encryptedMessage, decrypted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, openpgp.key.readArmored(this.decryptedPrivateKey)];
                    case 1:
                        privateKeyObject = (_a.sent()).keys[0];
                        return [4 /*yield*/, openpgp.message.readArmored(encrypted)];
                    case 2:
                        encryptedMessage = _a.sent();
                        return [4 /*yield*/, openpgp.decrypt({
                                message: encryptedMessage,
                                privateKeys: [privateKeyObject]
                            })];
                    case 3:
                        decrypted = (_a.sent()).data;
                        return [2 /*return*/, decrypted];
                }
            });
        });
    };
    KeyFile.prototype.updatePrivateKey = function (decryptedPrivateKey, password) {
        return __awaiter(this, void 0, void 0, function () {
            var privateKeyObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, openpgp.key.readArmored(decryptedPrivateKey)];
                    case 1:
                        privateKeyObject = (_a.sent()).keys[0];
                        return [4 /*yield*/, privateKeyObject.encrypt(password)];
                    case 2:
                        _a.sent();
                        this.encryptedPrivateKey = privateKeyObject.armor();
                        return [2 /*return*/];
                }
            });
        });
    };
    KeyFile.prototype.shareEntry = function (entryId, userSafe) {
        return __awaiter(this, void 0, void 0, function () {
            var decryptEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.decryptEntry(entryId)];
                    case 1:
                        decryptEntry = _a.sent();
                        return [4 /*yield*/, userSafe.addEntry(decryptEntry)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KeyFile.prototype.toJSON = function () {
        return {
            name: this.name,
            publicKey: this.publicKey,
            encryptedPrivateKey: this.encryptedPrivateKey,
            entries: this.entries
        };
    };
    return KeyFile;
}());
exports.KeyFile = KeyFile;
//# sourceMappingURL=index.js.map