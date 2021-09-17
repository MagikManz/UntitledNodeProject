const calculator = require('../../calculator')
const { BrowserWindow, globalShortcut, ipcMain } = require("electron")

const path = require('path')

const methods = ['add', 'sub', 'mult', 'div']

let opened = false

const createWindow = () => {
    if (opened) return
    opened = true

    const win = new BrowserWindow({
        width: 200,
        height: 200,
        frame: false,
        resizable: true,
        movable: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    let num0 = 0
    let num1 = 0
    let switched = false
    let cMethod

    const valuesReset = (n=0) => {
        switched = false
        cMethod = null
        num0 = n
        num1 = 0
    }

    const clearWindow = () => {
        win.webContents.send('clear-number')
        valuesReset()
    }

    const doMaths = (value, n=0) => {
        value = !value && value != 0 && 'IMPOSSIBLE TO CALCULATE' || value
        win.webContents.send('clear-number')
        win.webContents.send('add-number', value)
        valuesReset(n)
    }

    const addNum = (i) => {
        i = `${i}`
        if (num0 == '0') win.webContents.send('clear-number')
        win.webContents.send('add-number', i)
        if (switched) {
            num1 += i
        } else {
            num0 += i
        }
    }

    const hitEnter = () => {
        if (!(switched && cMethod)) return

        doMaths(calculator.Calculate(parseInt(num0), parseInt(num1), cMethod))
    }

    win.loadFile(path.join(__dirname, '/index.html'))
    win.setMenu(null)
    win.setMovable(true)
    win.setResizable(true)

    win.on("close", () => {
        opened = false
        globalShortcut.unregisterAll()
    })

    for (let i = 0; i < 10; i++) {
        globalShortcut.register(`num${i}`, () => {
            addNum(i)
        })

        globalShortcut.register(`${i}`, () => {
            addNum(i)
        })
    }

    globalShortcut.register('Delete', clearWindow)
    globalShortcut.register('Enter', hitEnter)

    globalShortcut.register('Backspace', () => {
        if (switched && num1 == '0' || !switched && num0 == '0') return
    
        win.webContents.send('remove-number')
        if (switched) {
            num1 = `${num1}`.slice(0, -1)
        } else {
            num0 = `${num0}`.slice(0, -1)
        }
    })

    methods.forEach((method) => {
        globalShortcut.register(`num${method}`, () => {
            cMethod = method
            switched = true
            win.webContents.send('clear-number')
        })
    })

    ipcMain.on('method-clicked', (_, data) => {
        if (data === 'AC') 
            return clearWindow()
            
        if (data === 'finish') 
            return hitEnter()

        const num = calculator[data](parseInt(num0))
        doMaths(num, num)
    })
}

module.exports = {
	name: "Vermulator",
	contributor: "Magik Manz, AndrewJ, Melone, xetrics, Not-Cyrus",
	exec: () => {
        createWindow()
    }
}