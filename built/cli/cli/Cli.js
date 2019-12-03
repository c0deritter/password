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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const KeyFileLogic_1 = __importDefault(require("../KeyFileLogic"));
class CLI {
    constructor(keyFileLogic) {
        this.keyFileLogic = keyFileLogic;
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.keyFileLogic.isKeyFileExists('master')) {
                console.log('Create master key file');
                let password = yield (new SetPasswordQuestion).ask();
                yield this.keyFileLogic.createKeyFile('master', password, false);
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setup();
            let superLoop = () => __awaiter(this, void 0, void 0, function* () {
                let option = yield (new MainMenuQuestion).ask();
                switch (option) {
                    case MainMenuOptions.AddKeyFile:
                        yield this.addKeyFile();
                        yield superLoop();
                        break;
                    case MainMenuOptions.AddEntry:
                        yield this.addEntry();
                        yield superLoop();
                        break;
                    case MainMenuOptions.Login:
                        yield this.login();
                        yield superLoop();
                        break;
                    default:
                        this.exit();
                        break;
                }
            });
            superLoop();
        });
    }
    addKeyFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let keyFileName = yield (new GetKeyFileNameQuestion).ask();
            let password = yield (new SetPasswordQuestion).ask();
            yield this.keyFileLogic.createKeyFile(keyFileName, password);
        });
    }
    addEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            let keyFile = yield (new SelectKeyFileQuestion(this.keyFileLogic)).ask();
            let entry = yield (new SetEntryQuestion).ask();
            yield keyFile.addEntry(entry);
            this.keyFileLogic.saveKeyFile(keyFile);
        });
    }
    exit() {
        process.exit();
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            let keyFile = yield (new SelectKeyFileQuestion(this.keyFileLogic)).ask();
            let password = yield (new GetPasswordQuestion).ask();
            yield keyFile.unlockKeyFileByPassword(password);
            let loginOption = yield (new LoginMenuQuestion(keyFile)).ask();
            switch (loginOption) {
                case LoginMenuOptions.GetEntry:
                    yield this.getEntry(keyFile);
                    break;
                case LoginMenuOptions.ShareKeys:
                    yield this.shareEntries(keyFile);
                    break;
                case LoginMenuOptions.ResetPassword:
                    yield this.resetPassword(keyFile);
                    break;
            }
        });
    }
    getEntry(keyFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let entryId = yield (new SelectEntryQuestion(keyFile)).ask();
            let entry = yield keyFile.decryptEntry(entryId);
            console.log(entry);
        });
    }
    shareEntries(sourceKeyFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let entryIds = yield (new SelectEntriesQuestion(sourceKeyFile)).ask();
            let destinationKeyFile = yield (new SelectKeyFileQuestion(this.keyFileLogic, ['master', sourceKeyFile.name])).ask();
            let entries = yield Promise.all(entryIds.map((entryId) => sourceKeyFile.decryptEntry(entryId)));
            yield Promise.all(entries.map((entry) => destinationKeyFile.addEntry(entry)));
            this.keyFileLogic.saveKeyFile(destinationKeyFile);
        });
    }
    resetPassword(masterKeyFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let entryId = yield (new SelectEntryQuestion(masterKeyFile)).ask();
            let password = yield (new SetPasswordQuestion).ask();
            let entry = yield masterKeyFile.decryptEntry(entryId);
            let targetKeyFile = this.keyFileLogic.getKeyFile(entry.entryName);
            if (targetKeyFile == undefined) {
                console.error('Target key file does not exist, can not reset password');
                return;
            }
            targetKeyFile.updatePrivateKey(entry.password, password);
            this.keyFileLogic.saveKeyFile(targetKeyFile);
        });
    }
}
var MainMenuOptions;
(function (MainMenuOptions) {
    MainMenuOptions["AddKeyFile"] = "AddKeyFile";
    MainMenuOptions["AddEntry"] = "AddEntry";
    MainMenuOptions["Login"] = "Login";
    MainMenuOptions["Exit"] = "Exit";
})(MainMenuOptions || (MainMenuOptions = {}));
class MainMenuQuestion {
    constructor() {
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
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
var LoginMenuOptions;
(function (LoginMenuOptions) {
    LoginMenuOptions["GetEntry"] = "GetEntry";
    LoginMenuOptions["ShareKeys"] = "ShareKeys";
    LoginMenuOptions["ResetPassword"] = "ResetPassword";
})(LoginMenuOptions || (LoginMenuOptions = {}));
class LoginMenuQuestion {
    constructor(keyFile) {
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
                        { name: 'Share keys', value: LoginMenuOptions.ShareKeys }
                    ]
            }];
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
class GetKeyFileNameQuestion {
    constructor() {
        this.config = [{
                type: 'input',
                name: 'keyFileName',
                message: 'Enter key file name'
            }];
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
class SelectKeyFileQuestion {
    constructor(keyFileManager, exclude = []) {
        this.keyFileManager = keyFileManager;
        this.exclude = exclude;
        this.config = [{
                type: 'list',
                name: 'selectKeyFile',
                message: 'Select key file',
                choices: this.keyFileManager.keyFiles
                    // if some of the key file is an exclude, reject
                    .filter((keyFile) => !this.exclude.some((exclude) => exclude === keyFile.name))
                    .map((keyFile) => { return { name: keyFile.name, value: keyFile }; })
            }];
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
class SelectEntryQuestion {
    constructor(keyFile) {
        this.keyFile = keyFile;
        this.config = [{
                type: 'list',
                name: 'selectEntry',
                message: 'Select Entry',
                choices: this.keyFile.entries.map((entry) => { return { name: entry.entryName, value: entry.id }; })
            }];
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
class SelectEntriesQuestion {
    constructor(keyFile) {
        this.keyFile = keyFile;
        this.config = [{
                type: 'checkbox',
                name: 'selectEntries',
                message: 'Select Entries',
                choices: this.keyFile.entries.map((entry) => { return { name: entry.entryName, value: entry.id }; })
            }];
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
class GetPasswordQuestion {
    constructor() {
        this.config = [{
                type: 'password',
                name: 'password',
                message: 'Enter password'
            }];
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            return answer[this.config[0].name];
        });
    }
}
class SetPasswordQuestion extends GetPasswordQuestion {
    constructor() {
        super();
        this.config.push({
            type: 'password',
            name: 'passwordRepeat',
            message: 'Repeat'
        });
    }
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield inquirer_1.default.prompt(this.config);
            if (answer[this.config[0].name] !== answer[this.config[0].name]) {
                console.log('Password unequal');
                return (new SetPasswordQuestion()).ask();
            }
            return answer[this.config[0].name];
        });
    }
}
class SetEntryQuestion {
    constructor() {
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
    ask() {
        return __awaiter(this, void 0, void 0, function* () {
            let nameAnswer = yield inquirer_1.default.prompt([this.config[0], this.config[1]]);
            let password = yield (new SetPasswordQuestion).ask();
            let metaAnswer = yield inquirer_1.default.prompt([this.config[2], this.config[3], this.config[4]]);
            return {
                entryName: nameAnswer[this.config[0].name],
                loginName: nameAnswer[this.config[1].name],
                password: password,
                description: metaAnswer[this.config[2].name],
                link: metaAnswer[this.config[3].name],
                tags: metaAnswer[this.config[4].name].split(',')
            };
        });
    }
}
(new CLI(new KeyFileLogic_1.default('keyFiles'))).start();
//# sourceMappingURL=Cli.js.map