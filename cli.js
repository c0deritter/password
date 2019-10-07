#!/usr/bin/env node

const inquirer = require('inquirer')
const process = require('process')
const fs = require('fs')
const path = require('path')

const { Board } = require('./node/lib')

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
        if(menuItem === 'Exit') {
            process.exit()
        }
    })
}

const loggedInMenu = (boardName, password) => {
    const sourceBoard = boardFileManager.getBoard(boardName)
    loginMenuDialog(sourceBoard).then((menuItem) => {
        if(menuItem === 'Get entry') {
            sourceBoard.unlockBoardByPassword(password)
            .then(() => {
                getEntryDialog(sourceBoard)
                .then((answers) => {
                    answers.selectBoard.decryptEntry(answers.selectEntry.id)
                    .then((decryptedEntry) => {
                        console.log(decryptedEntry)
                    })
                })
            })
        }
        if(menuItem === 'Share board key') {
            console.log('Destination board')
            selectBoardDialog([boardName])
            .then((destinationBoardName) => {
                const destinationBoard = boardFileManager.getBoard(destinationBoardName)

                sourceBoard.unlockBoardByPassword(password).then(() => {
                    sourceBoard.shareBoardKey(destinationBoard).then(() => {
                        boardFileManager.saveBoard(destinationBoard)
                    })
                })
            })
        }
        if (menuItem == 'Reset Password') {
            const masterBoard = boardFileManager.getBoard('master')
            masterBoard.unlockBoardByPassword(password)
            resetPasswordDialog(masterBoard).then((answers) => {
                const board = boardFileManager.getBoard(answers.decryptedMasterBoardEntry.entryName.replace('#', ''))
                board.encryptAndSetPrivateKey(answers.decryptedMasterBoardEntry.password, answers.password)
                .then(() => {
                    boardFileManager.saveBoard(board)
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
        choices: ['Add board', 'Add entry', 'Login', 'Exit']
    }]).then((answer) => answer.mainMenu)
}

const loginMenuDialog = (sourceBoard) => {
    let choices = ['Get entry', 'Share board key']
    if(sourceBoard.name === 'master') {
        choices = ['Get entry', 'Reset Password']
    }
    return inquirer.prompt([{
        type: 'list',
        name: 'mainMenu',
        message: 'Options',
        choices: choices
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

const getEntryDialog = (board) => {
    return board.unlockAllAccessableBoards(boardFileManager.boards)
    .then(() => {
        const unlockedBoards = boardFileManager.boards.filter((board) => !board.isLocked)
        return inquirer.prompt([{
            type: 'list',
            name: 'selectBoard',
            message: 'Select Board',
            choices: unlockedBoards.map((board) => { return { name: board.name, value: board }})
        }])
    })
    .then((answer) => answer.selectBoard)
    .then((board) => {
        if(board.entries.length === 0) {
            console.log('No Entry')
            process.exit()
        }
        return inquirer.prompt([{
            type: 'list',
            name: 'selectEntry',
            message: 'Select Entry',
            choices: board.entries.map((entry) => { return { name: entry.entryName, value: entry }})
        }])
        .then((answers) => { 
            answers.selectBoard = board
            return answers
         })
    })
}

const resetPasswordDialog = (masterBoard) => {
    if (masterBoard == undefined) {
        console.log('master board not found')
    }

    return inquirer.prompt([{
        type: 'list',
        name: 'masterBoardEntry',
        message: 'Select board',
        choices: masterBoard.entries.map((entry) => { return { name: entry.entryName.replace('#', ''), value: entry }})
    }])
    .then((resetBoardAnswer) => {
        return setPasswordDialog()
        .then((passwordAnswer) => {
            return masterBoard.decryptEntry(resetBoardAnswer.masterBoardEntry.id)
            .then((decryptedEntry) => {
                return {
                    decryptedMasterBoardEntry: decryptedEntry,
                    password: passwordAnswer.password
                }
            })
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
                tags: metaAnswers.tags.split(',')
            }
        })
    })
}

const selectBoardDialog = (excludes = []) => {
    const boardNames = boardFileManager.boards
    .map((board) => board.name)
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
            return new Board(rawBoardObject.name, rawBoardObject.publicKey, rawBoardObject.encryptedPrivateKey, rawBoardObject.entries)  
        })

        return boards
    }

    getBoard(boardName) {
        return this.boards.find((board) => {
            return board.name === boardName
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
            this.boards.push(newBoard)
    
            if (isMasterManaged) {
                const masterBoard = this.getBoard('master')
    
                if(masterBoard == null) {
                    console.error('Master board does not exist, can not add master managed user')
                    process.exit()
                }

                newBoard.unlockBoardByPassword(password).then(() => {
                    return masterBoard.addEntry({
                        entryName: '#' + boardName,
                        loginName: '#' + boardName,
                        password: newBoard.decryptedPrivateKey,
                        description: '',
                        tags: ''
                    })
                    .then(() => {
                        boardFileManager.saveBoard(masterBoard)
                    })
                })  
            }

            return newBoard
        })
    }

    saveBoard(board) {
        fs.writeFileSync(path.join(this.dir, board.name + '.board.json'), JSON.stringify(board, null, 4))
    }
}

const boardFileManager = new BoardFileManager(process.cwd())
start()