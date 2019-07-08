const inquirer = require('inquirer')
const keyboard = require('./lib')

const keyboardDir = './test'

const start = () => {

    if(!keyboard.isBoardExists(keyboardDir, 'master')) {
        console.log('Create master board')
        passwordDialog().then((answers) => {
            keyboard.addBoard(keyboardDir, 'master', answers.password, false)
        }).then(() => {
           mainMenu()
        })
    } else {
        mainMenu()
    }
}

const mainMenu = () => {
    mainMenuDialog().then((menuItem) => {
        if(menuItem === 'Add board') {
            addBoardDialog().then((addBoardAnswers) => {
                keyboard.addBoard(keyboardDir, addBoardAnswers.boardName, addBoardAnswers.password)
            })
        }
        if(menuItem === 'Add entry') {
            selectBoardDialog().then((selectBoard) => {
                addEntryDialog().then((entry) => {
                    keyboard.addEntry(keyboardDir, selectBoard, entry)
                })
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
    }]).then((answers) => {
        if (answers.password !== answers.passwordRepead) {
            console.log('Password unequal')
            process.exit()
        }

        return answers
    })
}

const mainMenuDialog = () => {
    return inquirer.prompt([{
        type: 'list',
        name: 'mainMenu',
        message: 'Options',
        choices: ['Add board', 'Add entry']
    }]).then((answer) => answer.mainMenu)
}

const addBoardDialog = () => {
    return inquirer.prompt([{
        type: 'input',
        name: 'boardName',
        message: 'Enter board name'
    }]).then((boardNameAnswer) => { 
        return passwordDialog().then((passwordAnswer) => {
            return {
                boardName: boardNameAnswer.boardName,
                password: passwordAnswer.password
            }
        })
    })
}

const addEntryDialog = () => {
    return inquirer.prompt([{
        type: 'input',
        name: 'entryName',
        message: 'Enter tool name or provider'
    },
    {
        type: 'input',
        name: 'loginName',
        message: 'Enter login name'
    }]).then((entryAnswer) => {
        return passwordDialog().then((passwordAnswer) =>{
            return {
                entryName: entryAnswer.entryName,
                loginName: entryAnswer.loginName,
                password: passwordAnswer.password
            }
        })
    }).then((loginAnswers) => {
        return inquirer.prompt([{
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
        }]).then((metaAnswers) => {
            return {
                entryName: loginAnswers.entryName,
                loginName: loginAnswers.loginName,
                password: loginAnswers.password,
                description: metaAnswers.description,
                link: metaAnswers.link,
                tags: metaAnswers.tags
            }
        })
    })
}

const selectBoardDialog = () => {
    const boardNames = keyboard.getAllBoardNames(keyboardDir)
    return inquirer.prompt([{
        type: 'list',
        name: 'selectBoard',
        message: 'Select board',
        choices: boardNames
    }])
    .then((selectBoardAnswer) => selectBoardAnswer.selectBoard)
}

start()