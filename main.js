const path = require('path');
const {
    app,
    shell,
    BrowserWindow,
    ipcMain,
    Tray,
    Menu,
    nativeImage,
} = require('electron');

//test config ----------------------------
const debug = process.argv.includes("debug");

let tray = ""; //musi byc globalne?

const myApp = {
    mainWindow: false,
    contextMenu: false,
    windowOpen: true,

    toggleWindow() {
        if (this.windowOpen) {
            this.mainWindow.minimize();
        } else {
            this.mainWindow.restore();
        }
    },

    makeCommunicationWithRender() {
        ipcMain.handle("saveScreenShot", async (event, args) => {
             const img = await this.makeScreenShoot();
             return img;
        })
    },

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1500,
            height: 1000,
            resizable: true,
            icon: path.join(__dirname, 'images/icon.png'),
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            }
        });

        this.mainWindow.on("minimize", e => {
            this.windowOpen = false;
        })

        this.mainWindow.on("restore", e => {
            this.windowOpen = true;
        })

        this.mainWindow.loadFile('index.html');

        if (!debug) {
            Menu.setApplicationMenu(null);
        }

        // this.mainWindow.show();
    },

    createContextMenu() {
        this.contextMenu = Menu.buildFromTemplate([
            {
                label: 'Author',
                role: 'help',
                click: () => {
                    shell.openExternal('http://domanart.pl/portfolio');
                }
            },
            {
                label: 'Help',
                role: 'help',
                click: () => {
                    let win = new BrowserWindow({
                        width: 800,
                        height: 550,
                        alwaysOnTop: true,
                        title: "PresentationDrawer help",
                        icon: path.join(__dirname, 'images/icon.ico')
                    });
                    win.setMenu(null);
                    win.on('closed', () => {
                        win = null
                    });
                    win.loadFile('help.html');
                }
            },
            {
                label: 'Quit program',
                role: 'close',
                click: () => {
                    this.mainWindow.close()
                }
            }
        ]);
    },

    createTrayIcon() {
        const imgPath = path.join(__dirname, 'images/icon.png');
        //const nimage = nativeImage.createFromPath(imgPath);
        tray = new Tray(imgPath);
        tray.setToolTip('PresentationDrawer');
        tray.on('click', () => {
            this.windowOpen = !this.windowOpen;
            this.toggleWindow(this.windowOpen);
        });
        tray.setContextMenu(this.contextMenu);
    },

    init() {
        //ubuntu fix
        //app.commandLine.appendSwitch('disable-transparent-visuals');
        //app.commandLine.appendSwitch('disable-gpu');
        //1
        //app.disableHardwareAcceleration()

        app.on('ready', () => {
            //ubuntu fix for black window1

            setTimeout(() => {
                this.createWindow();
                this.makeCommunicationWithRender();
                this.createContextMenu();
                this.createTrayIcon();
            }, 1000);
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit()
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
        });
    }
};

myApp.init();
