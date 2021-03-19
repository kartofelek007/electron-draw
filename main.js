const path = require('path');
const {
    app,
    shell,
    BrowserWindow,
    ipcMain,
    Tray,
    Menu,
    nativeImage,
    globalShortcut,
    dialog
} = require('electron');


//test config ----------------------------
const config = require("./config.js");
const configParser = require("./check-config.js");

const configTest = configParser(config);
if (configTest.errors.length) {
    const msg = `
        Incorrect format of config file.
        Correct below in %APPDATA%/presentation-draw-settings.json file:

        ${configTest.errors.map(el => {
            return `${el.property.replace("instance.", "")} ${el.message}`
        }).join("\n")}
    `;
    app.on('ready', () => {
        dialog.showMessageBoxSync({
            type: "error",
            title: "Incorrect config data",
            message: msg
        });
        app.quit();
    });
} else {
    const debug = true; //process.argv.includes("debug");

    let tray = ""; //musi byc globalne?

    const keyToggle = config.toggleKey;
    const keyExit = config.quitKey;

    const myApp = {
        mainWindow: false,
        contextMenu: false,
        windowOpen: true,

        async showFolderSelectPopup() {
            this.toggleWindow(false);
            const path = await dialog.showOpenDialog({
                title: 'Select folder to save screenshoot',
                properties: ["openDirectory"]
            });
            this.toggleWindow(true);
            return path.filePaths[0];
        },

        toggleWindow(show) {
            this.windowOpen = show;

            if (!show) {
                this.mainWindow.hide();
            } else {
                this.mainWindow.setFullScreen(true);
                this.mainWindow.show();
            }
        },

        makeCommunicationWithRender() {
            ipcMain.on('escPressed', (event, arg) => {

                this.toggleWindow(false);
                event.returnValue = ''
            });

            ipcMain.on('quitPressed', (event, arg) => {
                app.quit();
                event.returnValue = ''
            });

            ipcMain.on('getFolderToSave', async (event, arg) => {
                event.returnValue = await this.showFolderSelectPopup();
            });
        },

        createWindow() {

            //FIXME: fullScreen zostawia border po bokach na ktorych nei dziala kursor
            const { screen } = require("electron");
            const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

            this.mainWindow = new BrowserWindow({
                transparent: true,
                frame: false,
                alwaysOnTop: true,
                fullscreen: true,
                resizable: false,
                icon: path.join(__dirname, 'images/icon.png'),
                kiosk: true,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                    contextIsolation: false,
                }
            });

            this.mainWindow.loadFile('index.html');


            if (config.startHidden) {
                this.mainWindow.hide();
                this.windowOpen = false;
            }

            if (!debug) {
                Menu.setApplicationMenu(null);
            }

            //this.mainWindow.on("blur", e => {
            //    this.toggleWindow(false);
            //});

        },

        bindKeys() {
            //F7 - chowa aplikację - dość ważna funkcjonalność.
            //jak nie zadziała nie odpalam aplikacji
            const reg1 = globalShortcut.register(keyToggle, () => {
                this.windowOpen = !this.windowOpen;
                this.toggleWindow(this.windowOpen);
            });


            if (!reg1) {
                let msg = `Nie udało się zarejestrować klawiszy:\n\n`;

                if (!reg1) {
                    msg += config.toggleKey + " - klawisze służące do pokazywania/ukrywania okna aplikacji\n";
                    msg += "\nZmień je na inne w pliku settings.json (toggleKey) i spróbuj ponownie"
                }

                dialog.showMessageBoxSync({
                    type: "error",
                    title: "Błąd rejestracji klawiszy",
                    message: msg
                })
            }

            return reg1;
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
                    if (this.bindKeys()) {
                        this.createWindow();
                        this.makeCommunicationWithRender();
                        this.createContextMenu();
                        this.createTrayIcon();
                    } else {
                        app.quit()
                    }
                }, 1000);
            });

            app.on('window-all-closed', () => {
                if (process.platform !== 'darwin') app.quit()
            });

            app.on('will-quit', () => {
                globalShortcut.unregister(keyToggle);
                globalShortcut.unregister(keyExit);
            });

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
            });


        }
    };

    myApp.init();
}
