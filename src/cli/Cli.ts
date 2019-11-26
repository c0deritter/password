#!/usr/bin/env node

import inquierer, { Question, ListQuestion } from 'inquirer'
import { KeyFile, DecryptedEntry } from '../KeyFileModel'
import KeyFileLogic from '../KeyFileLogic'

class CLI {
    constructor(private keyFileLogic: KeyFileLogic) {}

    private async setup() {
        if(!this.keyFileLogic.isKeyFileExists('master')) {
            console.log('Create master key file')

            let password = await (new SetPasswordQuestion).ask()
            await this.keyFileLogic.createKeyFile('master', password, false)
        }
    }

    public async start() {
        await this.setup()

        let superLoop = async () => {
            let option = await (new MainMenuQuestion).ask()

            switch(option) {
                case MainMenuOptions.AddKeyFile: await this.addKeyFile(); await superLoop(); break
                case MainMenuOptions.AddEntry: await this.addEntry(); await superLoop(); break
                case MainMenuOptions.Login: await this.login(); await superLoop(); break
                default: this.exit(); break
            }
        }
        superLoop()
    }

    private async addKeyFile() {
        let keyFileName = await (new GetKeyFileNameQuestion).ask()
        let password = await (new SetPasswordQuestion).ask()

        await this.keyFileLogic.createKeyFile(keyFileName, password)
    }

    private async addEntry() {
        let keyFile  = await (new SelectKeyFile(this.keyFileLogic)).ask()
        let entry = await (new SetEntryQuestion).ask()

        await keyFile.addEntry(entry)

        this.keyFileLogic.saveKeyFile(keyFile)
    }

    private exit() {
        process.exit()
    }

    private async login() {
        let keyFile = await (new SelectKeyFile(this.keyFileLogic)).ask()
        let password = await (new GetPasswordQuestion).ask()

        await keyFile.unlockKeyFileByPassword(password)

        let loginOption = await (new LoginMenuQuestion(keyFile)).ask()

        switch (loginOption) {
            case LoginMenuOptions.GetEntry: await this.getEntry(keyFile); break
            case LoginMenuOptions.ShareKey: await this.shareEntry(keyFile); break
            case LoginMenuOptions.ResetPassword: await this.resetPassword(keyFile); break
        }
    }

    private async getEntry(keyFile: KeyFile) {
        let entryId = await (new SelectEntryQuestion(keyFile)).ask()

        let entry = await keyFile.decryptEntry(entryId)
        console.log(entry)
    }

    private async shareEntry(sourceKeyFile: KeyFile) {
        let entryId = await (new SelectEntryQuestion(sourceKeyFile)).ask()
        let destinationKeyFile = await (new SelectKeyFile(this.keyFileLogic, ['master', sourceKeyFile.name])).ask()

        let entry = await sourceKeyFile.decryptEntry(entryId)
        await destinationKeyFile.addEntry(entry)

        this.keyFileLogic.saveKeyFile(destinationKeyFile)
    }

    public async resetPassword(masterKeyFile: KeyFile) {
        let entryId = await (new SelectEntryQuestion(masterKeyFile)).ask()
        let password = await (new SetPasswordQuestion).ask()

        let entry = await masterKeyFile.decryptEntry(entryId)
        let targetKeyFile = this.keyFileLogic.getKeyFile(entry.entryName)

        if (targetKeyFile == undefined) {
            console.error('Target key file does not exist, can not reset password')
            return
        }

        targetKeyFile.updatePrivateKey(entry.password, password)
        this.keyFileLogic.saveKeyFile(targetKeyFile)
    }
}

enum MainMenuOptions {
    AddKeyFile = 'AddKeyFile',
    AddEntry = 'AddEntry',
    Login = 'Login',
    Exit = 'Exit'
}

class MainMenuQuestion {
    public config: Question[] = <ListQuestion[]>[{
        type: 'list',
        name: 'mainMenu',
        message: 'Options',
        choices: [
            { name: 'Add key file', value: MainMenuOptions.AddKeyFile },
            { name: 'Add entry', value: MainMenuOptions.AddEntry },
            { name: 'Login', value: MainMenuOptions.Login },
            { name: 'Exit', value: MainMenuOptions.Exit }
        ]
    }]

    public async ask(): Promise<MainMenuOptions> {
        let answer = await inquierer.prompt(this.config)
        return answer[<string>this.config[0].name]
    }
}

enum LoginMenuOptions {
    GetEntry = 'GetEntry',
    ShareKey = 'ShareKey',
    ResetPassword = 'ResetPassword'
}

class LoginMenuQuestion {
    public config: Question[] = <ListQuestion[]>[{
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
    }]

    constructor(private keyFile: KeyFile) {}

    public async ask(): Promise<LoginMenuOptions> {
        let answer = await inquierer.prompt(this.config)
        return answer[<string>this.config[0].name]
    }
}

class GetKeyFileNameQuestion {
    public config: Question[] = [{
        type: 'input',
        name: 'keyFileName',
        message: 'Enter key file name'
    }]

    public async ask(): Promise<string> {
        let answer = await inquierer.prompt(this.config)
        return answer[<string>this.config[0].name]
    }
}

class SelectKeyFile {
    public config: Question[] = <ListQuestion[]> [{
        type: 'list',
        name: 'selectKeyFile',
        message: 'Select key file',
        choices: this.keyFileManager.keyFiles
        // if some of the key file is an exclude, reject
        .filter((keyFile) => !this.exclude.some((exclude) => exclude === keyFile.name))
        .map((keyFile) => { return { name: keyFile.name, value: keyFile }})
    }]

    constructor(private keyFileManager: KeyFileLogic, private exclude: string[] = []) {}

    public async ask(): Promise<KeyFile> {
        let answer = await inquierer.prompt(this.config)
        return answer[<string>this.config[0].name]
    }
}

class SelectEntryQuestion {
    public config: Question[] = <ListQuestion[]> [{
        type: 'list',
        name: 'selectEntry',
        message: 'Select Entry',
        choices: this.keyFile.entries.map((entry) => { return { name: entry.entryName, value: entry.id } })
    }]

    constructor(private keyFile: KeyFile) {}

    public async ask(): Promise<string> {
        let answer = await inquierer.prompt(this.config)
        return answer[<string>this.config[0].name]
    }
}

class GetPasswordQuestion {
    public config: Question[] = [{
        type: 'password',
        name: 'password',
        message: 'Enter password'
    }]

    public async ask(): Promise<string> {
        let answer = await inquierer.prompt(this.config)
        return answer[<string>this.config[0].name]
    }
}

class SetPasswordQuestion extends GetPasswordQuestion {
    constructor() {
        super()
        this.config.push(
            {
                type: 'password',
                name: 'passwordRepeat',
                message: 'Repeat'
            }
        )
    }

    public async ask(): Promise<string> {
        let answer = await inquierer.prompt(this.config)
        
        if(answer[<string>this.config[0].name] !== answer[<string>this.config[0].name]) {
            console.log('Password unequal')
            return (new SetPasswordQuestion()).ask()
        }

        return answer[<string>this.config[0].name]
    }
}

class SetEntryQuestion {
    public config: Question[] = [{
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
    },{
        type: 'input',
        name: 'link',
        message: 'Link of the website'
    },{
        type: 'input',
        name: 'tags',
        message: 'Add tags separated by commas'
    }]

    public async ask(): Promise<DecryptedEntry> {
        let nameAnswer = await inquierer.prompt([this.config[0], this.config[1]])
        let password = await (new SetPasswordQuestion).ask()
        let metaAnswer = await inquierer.prompt([this.config[2], this.config[3], this.config[4]])

        return {
            entryName: nameAnswer[<string>this.config[0].name],
            loginName: nameAnswer[<string>this.config[1].name],
            password: password,
            description: metaAnswer[<string>this.config[2].name],
            link: metaAnswer[<string>this.config[3].name],
            tags: (<string> metaAnswer[<string>this.config[4].name]).split(',')
        }
    }
}

(new CLI(new KeyFileLogic('keyFiles'))).start()