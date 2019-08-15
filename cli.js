const inquirer = require('inquirer')
const keyboard = require('./lib')

const keyboardDir = './test'

const start = () => {

    if(!keyboard.isBoardExists(keyboardDir, 'master')) {
        console.log('Create master board')
        setPasswordDialog().then((answers) => {
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
            selectBoardDialog().then((selectedBoard) => {
                addEntryDialog().then((entry) => {
                    keyboard.addEntry(keyboardDir, selectedBoard, entry)
                })
            })
        }
        if(menuItem === 'Login') {
            loginDialog().then(({ board, password }) => {
                loggedInMenu(board, password)
            })
        }
    })
}

const loggedInMenu = (board, password) => {
    loginMenuDialog().then((menuItem) => {
        if(menuItem === 'Get entry') {
            getEntryDialog(board, password)
            .then((entry) => {
                console.log(entry)
            })
        }
        if(menuItem === 'Share board key') {
            console.log('Destination board')
            selectBoardDialog([board])
            .then((destinationBoard) => {
                keyboard.shareBoardKey(keyboardDir, board, password, destinationBoard)
            })
        }
    })
}

const setPasswordDialog = () => {
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
        choices: ['Add board', 'Add entry', 'Login']
    }]).then((answer) => answer.mainMenu)
}

const loginMenuDialog = () => {
    return inquirer.prompt([{
        type: 'list',
        name: 'mainMenu',
        message: 'Options',
        choices: ['Get entry', 'Share board key']
    }]).then((answer) => answer.mainMenu)
}

const addBoardDialog = () => {
    return inquirer.prompt([{
        type: 'input',
        name: 'boardName',
        message: 'Enter board name'
    }]).then((boardNameAnswer) => { 
        return setPasswordDialog().then((passwordAnswer) => {
            return {
                boardName: boardNameAnswer.boardName,
                password: passwordAnswer.password
            }
        })
    })
}

const getEntryDialog = (board, password) => {
    return keyboard.getAllAccessableEntries(keyboardDir, board, password)
    .then((groupEntries) => {
        return inquirer.prompt([{
            type: 'list',
            name: 'selectBoard',
            message: 'Select Board',
            choices: groupEntries.map((groupEntry) => { return { name: groupEntry.boardName, value: groupEntry }})
        }])
    })
    .then((answer) => answer.selectBoard)
    .then((board) => {
        return inquirer.prompt([{
            type: 'list',
            name: 'selectEntry',
            message: 'Select Entry',
            choices: board.entries.map((entry) => { return { name: entry.entryName, value: entry }})
        }])
        .then((answer) => answer.selectEntry)
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
        return setPasswordDialog().then((passwordAnswer) =>{
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

const selectBoardDialog = (excludes = []) => {
    const boardNames = keyboard.getAllBoardNames(keyboardDir).filter((boardName) => {
        return !excludes.some((exclude) => {
            return boardName === exclude
        })
    })

    return inquirer.prompt([{
        type: 'list',
        name: 'selectBoard',
        message: 'Select board',
        choices: boardNames
    }])
    .then((selectBoardAnswer) => selectBoardAnswer.selectBoard)
}

const passwordDialog = () => {
    return inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: 'Enter password'
    }])
    .then((answer) => answer.password)
}

const loginDialog = () => {
    return selectBoardDialog()
    .then((board) => {
        return passwordDialog().then((password) => {
            return {
                password,
                board
            } 
        })
    })
}
start()