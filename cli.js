const inquirer = require('inquirer')
const keyboard = require('./lib')

const keyboardDir = './test'

const start = () => {

    if(!keyboard.isBoardExists(keyboardDir, 'master')) {
        console.log('Create master board')
        passwordDialog().then((anwsers) => {
            keyboard.addBoard(keyboardDir, 'master', anwsers.password, false)
        }).then(() => {
           mainMenu()
        })
    } else {
        mainMenu()
    }
}

const mainMenu = () => {
    mainMenuDialog().then((mainMenuAnwsers) => {
        if(mainMenuAnwsers.mainMenu === 'Add board') {
            addBoardDialog().then((addBoardAnwsers) => {
                keyboard.addBoard(keyboardDir, addBoardAnwsers.boardName, addBoardAnwsers.password)
            })
        }
    })
}

const passwordDialog = () => {
    return inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: 'Enter password'
    },{
        type: 'password',
        name: 'passwordRepead',
        message: 'Repead'
    }]).then((anwsers) => {
        if (anwsers.password !== anwsers.passwordRepead) {
            console.log('Password unequal')
            process.exit()
        }

        return anwsers
    })
}

const mainMenuDialog = () => {
    return inquirer.prompt([{
        type: 'list',
        name: 'mainMenu',
        message: 'Options',
        choices: ['Add board']
    }])
}

const addBoardDialog = () => {
    return inquirer.prompt([{
        type: 'input',
        name: 'boardName',
        message: 'Enter board name'
    }]).then((boardNameAnwser) => { 
        return passwordDialog().then((passwordAnwser) => {
            return {
                boardName: boardNameAnwser.boardName,
                password: passwordAnwser.password
            }
        })
    })
}

const addAccountDialog = () => {
    return inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Enter tool name or provider'
    },
    {
        type: 'input',
        name: 'description',
        message: 'Enter description in markdown'
    },
    {
        type: 'input',
        name: 'loginName',
        message: 'Enter login name'
    }]).then((addAccountAnwser) => {
        return passwordDialog().then((passwordAnwser) =>{
            return {
                name: addAccountAnwser.name,
                description: addAccountAnwser,
                loginName: addAccountAnwser.loginName,
                password: passwordAnwser.password
            }
        })
    })
}

start()