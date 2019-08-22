const inquirer = require('inquirer')
const process = require('process')
const fs = require('fs')
const path = require('path')

// lib.js should run in the browser and in node as well therefore openpgp must be global
openpgp = require('openpgp')

const { Board } = require('./lib')

const start = () => {
    if(!boardFileManager.isBoardExists('master')) {
        console.log('Create master board')
        setPasswordDialog().then((answers) => {
            boardFileManager.createBoard('master', answers.password, false)
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
                boardFileManager.createBoard(addBoardAnswers.boardName, addBoardAnswers.password)
            })
        }
        if(menuItem === 'Add entry') {
            selectBoardDialog().then((selectedBoardName) => {
                addEntryDialog().then((entry) => {
                    const selectBoard = boardFileManager.getBoard(selectedBoardName)
                    selectBoard.addEntry(entry)
                    .then(() => {
                        boardFileManager.saveBoard(selectBoard)
                    })
                })
            })
        }
        if(menuItem === 'Login') {
            loginDialog().then(({ boardName, password }) => {
                loggedInMenu(boardName, password)
            })
        }
    })
}

const loggedInMenu = (boardName, password) => {
    loginMenuDialog().then((menuItem) => {
        if(menuItem === 'Get entry') {
            getEntryDialog(boardName, password)
            .then((entry) => {
                console.log(entry)
            })
        }
        if(menuItem === 'Share board key') {
            console.log('Destination board')
            selectBoardDialog([boardName])
            .then((destinationBoardName) => {
                const sourceBoard = boardFileManager.getBoard(boardName)
                const destinationBoard = boardFileManager.getBoard(destinationBoardName)

                sourceBoard.shareBoardKey(password, destinationBoard).then(() => {
                    boardFileManager.saveBoard(destinationBoard)
                })
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

const getEntryDialog = (boardName, password) => {
    return boardFileManager.getBoard(boardName).getAllAccessableEntries(boardFileManager.boards, password)
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
    const boardNames = boardFileManager.boards
    .map((board) => board.boardName)
    .filter((boardName) => {
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
    .then((boardName) => {
        return passwordDialog().then((password) => {
            return {
                password,
                boardName
            } 
        })
    })
}

class BoardFileManager {
    constructor(dir) {
        this.dir = dir
        this.boards = this.getAllBoards()
    }

    getAllBoards() {
        const boardFileNames = fs.readdirSync(this.dir).filter((boardName) => {
            return boardName.search(/.*.board.json$/gm) !== -1
        })
    
        const boards = boardFileNames.map((fileName) => {
            const rawBoardObject = JSON.parse(fs.readFileSync(path.join(this.dir, fileName), { encoding: 'utf8' }))
            return new Board(rawBoardObject.boardName, rawBoardObject.publicKey, rawBoardObject.privateKey, rawBoardObject.entries)  
        })

        return boards
    }

    getBoard(boardName) {
        return this.boards.find((board) => {
            return board.boardName === boardName
        })
    }

    isBoardExists(boardName) {
        return this.getBoard(boardName) == null ? false : true
    }

    createBoard(boardName, password, isMasterManaged = true) {
        if(boardFileManager.isBoardExists(boardName)) {
            console.error('Board does already exist, can not add board')
            process.exit()
        }

        return Board.create(boardName, password).then((newBoard) => {
            this.saveBoard(newBoard)
    
            if (isMasterManaged) {
                const masterBoard = this.getBoard('master')
    
                if(masterBoard == null) {
                    console.error('Master board does not exist, can not add master managed user')
                    process.exit()
                }
    
                masterBoard.addEntry({
                    entryName: '#' + boardName,
                    loginName: '#' + boardName,
                    password: newBoard.decryptPrivateKey(password),
                    description: '',
                    tags: ''
                })
                .then(() => {
                    boardFileManager.saveBoard(masterBoard)
                })
            }

            return newBoard
        })
    }

    saveBoard(board) {
        fs.writeFileSync(path.join(this.dir, board.boardName + '.board.json'), JSON.stringify(board, null, 4))
    }
}

const boardFileManager = new BoardFileManager(process.cwd())
start()