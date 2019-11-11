"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = __importDefault(require("inquirer"));
var FileManager_1 = __importDefault(require("./FileManager"));
var CLI = /** @class */ (function () {
    function CLI(keyFileManager) {
        this.keyFileManager = keyFileManager;
    }
    CLI.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var password;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.keyFileManager.isKeyFileExists('master')) return [3 /*break*/, 3];
                        console.log('Create master key file');
                        return [4 /*yield*/, (new SetPasswordQuestion).ask()];
                    case 1:
                        password = _a.sent();
                        return [4 /*yield*/, this.keyFileManager.createKeyFile('master', password, false)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var superLoop;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setup()];
                    case 1:
                        _a.sent();
                        superLoop = function () { return __awaiter(_this, void 0, void 0, function () {
                            var option, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, (new MainMenuQuestion).ask()];
                                    case 1:
                                        option = _b.sent();
                                        _a = option;
                                        switch (_a) {
                                            case MainMenuOptions.AddKeyFile: return [3 /*break*/, 2];
                                            case MainMenuOptions.AddEntry: return [3 /*break*/, 5];
                                            case MainMenuOptions.Login: return [3 /*break*/, 8];
                                        }
                                        return [3 /*break*/, 11];
                                    case 2: return [4 /*yield*/, this.addKeyFile()];
                                    case 3:
                                        _b.sent();
                                        return [4 /*yield*/, superLoop()];
                                    case 4:
                                        _b.sent();
                                        return [3 /*break*/, 12];
                                    case 5: return [4 /*yield*/, this.addEntry()];
                                    case 6:
                                        _b.sent();
                                        return [4 /*yield*/, superLoop()];
                                    case 7:
                                        _b.sent();
                                        return [3 /*break*/, 12];
                                    case 8: return [4 /*yield*/, this.login()];
                                    case 9:
                                        _b.sent();
                                        return [4 /*yield*/, superLoop()];
                                    case 10:
                                        _b.sent();
                                        return [3 /*break*/, 12];
                                    case 11:
                                        this.exit();
                                        return [3 /*break*/, 12];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        }); };
                        superLoop();
                        return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.addKeyFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keyFileName, password;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (new GetKeyFileNameQuestion).ask()];
                    case 1:
                        keyFileName = _a.sent();
                        return [4 /*yield*/, (new SetPasswordQuestion).ask()];
                    case 2:
                        password = _a.sent();
                        return [4 /*yield*/, this.keyFileManager.createKeyFile(keyFileName, password)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.addEntry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keyFile, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (new SelectKeyFile(this.keyFileManager)).ask()];
                    case 1:
                        keyFile = _a.sent();
                        return [4 /*yield*/, (new SetEntryQuestion).ask()];
                    case 2:
                        entry = _a.sent();
                        return [4 /*yield*/, keyFile.addEntry(entry)];
                    case 3:
                        _a.sent();
                        this.keyFileManager.saveKeyFile(keyFile);
                        return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.exit = function () {
        process.exit();
    };
    CLI.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keyFile, password, loginOption, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (new SelectKeyFile(this.keyFileManager)).ask()];
                    case 1:
                        keyFile = _b.sent();
                        return [4 /*yield*/, (new GetPasswordQuestion).ask()];
                    case 2:
                        password = _b.sent();
                        return [4 /*yield*/, keyFile.unlockKeyFileByPassword(password)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (new LoginMenuQuestion(keyFile)).ask()];
                    case 4:
                        loginOption = _b.sent();
                        _a = loginOption;
                        switch (_a) {
                            case LoginMenuOptions.GetEntry: return [3 /*break*/, 5];
                            case LoginMenuOptions.ShareKey: return [3 /*break*/, 7];
                            case LoginMenuOptions.ResetPassword: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.getEntry(keyFile)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.shareEntry(keyFile)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.resetPassword(keyFile)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.getEntry = function (keyFile) {
        return __awaiter(this, void 0, void 0, function () {
            var entryId, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (new SelectEntryQuestion(keyFile)).ask()];
                    case 1:
                        entryId = _a.sent();
                        return [4 /*yield*/, keyFile.decryptEntry(entryId)];
                    case 2:
                        entry = _a.sent();
                        console.log(entry);
                        return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.shareEntry = function (sourceKeyFile) {
        return __awaiter(this, void 0, void 0, function () {
            var entryId, destinationKeyFile, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (new SelectEntryQuestion(sourceKeyFile)).ask()];
                    case 1:
                        entryId = _a.sent();
                        return [4 /*yield*/, (new SelectKeyFile(this.keyFileManager, ['master', sourceKeyFile.name])).ask()];
                    case 2:
                        destinationKeyFile = _a.sent();
                        return [4 /*yield*/, sourceKeyFile.decryptEntry(entryId)];
                    case 3:
                        entry = _a.sent();
                        return [4 /*yield*/, destinationKeyFile.addEntry(entry)];
                    case 4:
                        _a.sent();
                        this.keyFileManager.saveKeyFile(destinationKeyFile);
                        return [2 /*return*/];
                }
            });
        });
    };
    CLI.prototype.resetPassword = function (masterKeyFile) {
        return __awaiter(this, void 0, void 0, function () {
            var entryId, password, entry, targetKeyFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (new SelectEntryQuestion(masterKeyFile)).ask()];
                    case 1:
                        entryId = _a.sent();
                        return [4 /*yield*/, (new SetPasswordQuestion).ask()];
                    case 2:
                        password = _a.sent();
                        return [4 /*yield*/, masterKeyFile.decryptEntry(entryId)];
                    case 3:
                        entry = _a.sent();
                        targetKeyFile = this.keyFileManager.getKeyFile(entry.entryName);
                        if (targetKeyFile == undefined) {
                            console.error('Target key file does not exist, can not reset password');
                            return [2 /*return*/];
                        }
                        targetKeyFile.updatePrivateKey(entry.password, password);
                        this.keyFileManager.saveKeyFile(targetKeyFile);
                        return [2 /*return*/];
                }
            });
        });
    };
    return CLI;
}());
var MainMenuOptions;
(function (MainMenuOptions) {
    MainMenuOptions["AddKeyFile"] = "AddKeyFile";
    MainMenuOptions["AddEntry"] = "AddEntry";
    MainMenuOptions["Login"] = "Login";
    MainMenuOptions["Exit"] = "Exit";
})(MainMenuOptions || (MainMenuOptions = {}));
var MainMenuQuestion = /** @class */ (function () {
    function MainMenuQuestion() {
        this.config = [{
                type: 'list',
                name: 'mainMenu',
                message: 'Options',
                choices: [
                    { name: 'Add key file', value: MainMenuOptions.AddKeyFile },
                    { name: 'Add entry', value: MainMenuOptions.AddEntry },
                    { name: 'Login', value: MainMenuOptions.Login },
                    { name: 'Exit', value: MainMenuOptions.Exit }
                ]
            }];
    }
    MainMenuQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return MainMenuQuestion;
}());
var LoginMenuOptions;
(function (LoginMenuOptions) {
    LoginMenuOptions["GetEntry"] = "GetEntry";
    LoginMenuOptions["ShareKey"] = "ShareKey";
    LoginMenuOptions["ResetPassword"] = "ResetPassword";
})(LoginMenuOptions || (LoginMenuOptions = {}));
var LoginMenuQuestion = /** @class */ (function () {
    function LoginMenuQuestion(keyFile) {
        this.keyFile = keyFile;
        this.config = [{
                type: 'list',
                name: 'mainMenu',
                message: 'Options',
                choices: this.keyFile.name === 'master' ?
                    [
                        { name: 'Get entry', value: LoginMenuOptions.GetEntry },
                        { name: 'Reset password', value: LoginMenuOptions.ResetPassword }
                    ] :
                    [
                        { name: 'Get entry', value: LoginMenuOptions.GetEntry },
                        { name: 'Share key', value: LoginMenuOptions.ShareKey }
                    ]
            }];
    }
    LoginMenuQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return LoginMenuQuestion;
}());
var GetKeyFileNameQuestion = /** @class */ (function () {
    function GetKeyFileNameQuestion() {
        this.config = [{
                type: 'input',
                name: 'keyFileName',
                message: 'Enter key file name'
            }];
    }
    GetKeyFileNameQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return GetKeyFileNameQuestion;
}());
var SelectKeyFile = /** @class */ (function () {
    function SelectKeyFile(keyFileManager, exclude) {
        var _this = this;
        if (exclude === void 0) { exclude = []; }
        this.keyFileManager = keyFileManager;
        this.exclude = exclude;
        this.config = [{
                type: 'list',
                name: 'selectKeyFile',
                message: 'Select key file',
                choices: this.keyFileManager.keyFiles
                    // if some of the key file is an exclude, reject
                    .filter(function (keyFile) { return !_this.exclude.some(function (exclude) { return exclude === keyFile.name; }); })
                    .map(function (keyFile) { return { name: keyFile.name, value: keyFile }; })
            }];
    }
    SelectKeyFile.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return SelectKeyFile;
}());
var SelectEntryQuestion = /** @class */ (function () {
    function SelectEntryQuestion(keyFile) {
        this.keyFile = keyFile;
        this.config = [{
                type: 'list',
                name: 'selectEntry',
                message: 'Select Entry',
                choices: this.keyFile.entries.map(function (entry) { return { name: entry.entryName, value: entry.id }; })
            }];
    }
    SelectEntryQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return SelectEntryQuestion;
}());
var GetPasswordQuestion = /** @class */ (function () {
    function GetPasswordQuestion() {
        this.config = [{
                type: 'password',
                name: 'password',
                message: 'Enter password'
            }];
    }
    GetPasswordQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return GetPasswordQuestion;
}());
var SetPasswordQuestion = /** @class */ (function (_super) {
    __extends(SetPasswordQuestion, _super);
    function SetPasswordQuestion() {
        var _this = _super.call(this) || this;
        _this.config.push({
            type: 'password',
            name: 'passwordRepead',
            message: 'Repead'
        });
        return _this;
    }
    SetPasswordQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt(this.config)];
                    case 1:
                        answer = _a.sent();
                        if (answer[this.config[0].name] !== answer[this.config[0].name]) {
                            console.log('Password unequal');
                            return [2 /*return*/, (new SetPasswordQuestion()).ask()];
                        }
                        return [2 /*return*/, answer[this.config[0].name]];
                }
            });
        });
    };
    return SetPasswordQuestion;
}(GetPasswordQuestion));
var SetEntryQuestion = /** @class */ (function () {
    function SetEntryQuestion() {
        this.config = [{
                type: 'input',
                name: 'entryName',
                message: 'Enter tool name or provider'
            },
            {
                type: 'input',
                name: 'loginName',
                message: 'Enter login name'
            },
            {
                type: 'editor',
                name: 'description',
                message: 'Enter description in markdown'
            }, {
                type: 'input',
                name: 'link',
                message: 'Link of the website'
            }, {
                type: 'input',
                name: 'tags',
                message: 'Add tags separated by commas'
            }];
    }
    SetEntryQuestion.prototype.ask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nameAnswer, password, metaAnswer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt([this.config[0], this.config[1]])];
                    case 1:
                        nameAnswer = _a.sent();
                        return [4 /*yield*/, (new SetPasswordQuestion).ask()];
                    case 2:
                        password = _a.sent();
                        return [4 /*yield*/, inquirer_1.default.prompt([this.config[2], this.config[3], this.config[4]])];
                    case 3:
                        metaAnswer = _a.sent();
                        return [2 /*return*/, {
                                entryName: nameAnswer[this.config[0].name],
                                loginName: nameAnswer[this.config[1].name],
                                password: password,
                                description: metaAnswer[this.config[2].name],
                                link: metaAnswer[this.config[3].name],
                                tags: metaAnswer[this.config[4].name].split(',')
                            }];
                }
            });
        });
    };
    return SetEntryQuestion;
}());
(new CLI(new FileManager_1.default(process.cwd()))).start();
//# sourceMappingURL=index.js.map