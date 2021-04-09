import pubsub from "./pubsub.js";
import globalState from "./global-state.js";
import { savePrintScreen } from "./utils/savePrintScreen.js";
const { ipcRenderer } = require('electron');

function metaKeysPress(e) {
    return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey
}

const functionsToBind = {
    mousemove(e) {
        globalState.setMouse({ x : e.pageX });
        globalState.setMouse({ y : e.pageY });
    },

    keyUpClearScreen(e) {
        if (globalState.canChangeTool && globalState.canChangeColor) {
            if (e.key.toLowerCase() === globalState.getConfig().keys.clearScreen && !metaKeysPress(e)) {
                pubsub.emit("board-clearCanvas1");
            }
        }
    },

    keyUpGuiHelp(e) {
        if (e.key === "?" && metaKeysPress(e) && globalState.canChangeColor && globalState.canChangeSize && globalState.canChangeTool) {
            pubsub.emit("gui-toggleHelpKey");
        }
    },

    keyUpTool(e) {
        const keys = globalState.getConfig().keys.tools.map(el => el.key);

        if (globalState.canChangeTool) {
            if (keys.includes(e.key)) {
                console.log(globalState.getConfig());
                globalState.getConfig().keys.tools.forEach(el => {
                    if (e.key === el.key) {
                        console.log(e.key);
                        globalState.setTool(el.tool);
                    }
                });
            }
        }
    },

    keyUpColor(e) {
        const keys = globalState.getConfig().keys.colors.map(el => el.key);
        if (globalState.canChangeColor) {
            if (keys.includes(e.key)) {
                globalState.getConfig().keys.colors.forEach(el => {
                    if (e.key === el.key && !metaKeysPress(e)) {
                        globalState.setColor(el.color);
                    }
                });
            }
        }
    },

    wheelSize(e) {
        if (globalState.canChangeSize) {
            if (!["spot"].includes(globalState.getTool().name)) {
                if (e.deltaY > 0) globalState.decreaseSize();
                if (e.deltaY < 0) globalState.increaseSize();
            } else {
                //dla pubsub muszę nieco inaczej zwiekszac rozmiar
                //i nie wplywac na rozmiar reszty narzedzi
                pubsub.emit("tool-size", e);
            }
        }
    },

    whiteBoard(e) {
        if (globalState.canChangeTool && globalState.canChangeColor) {
            if (e.key === globalState.getConfig().keys.whiteBoard && !metaKeysPress(e)) {
                document.body.classList.toggle("white-board-mode");
            }
        }
    },

    showHideGui(e) {
        if (globalState.canChangeTool && globalState.canChangeColor && globalState.canChangeSize) {
            if (e.key === '`') {
                pubsub.emit("gui-hide");
            }
        }
    },

    escape(e) {
        if (e.key.toUpperCase() === "ESCAPE" && globalState.canChangeTool) {
            pubsub.emit("board-clearCanvas1");

            setTimeout(() => {
                if (globalState.getTool() !== null) {
                    pubsub.emit("board-clearCanvas2");
                    globalState.getTool().destructor();
                }

                globalState.setTool("brush");
                pubsub.emit("tool-type");

                document.body.classList.remove("white-board-mode");
                ipcRenderer.sendSync('escPressed', {});
            }, 100)
        }
    },

    quit(e) {
        //ctrl + q
        if (e.ctrlKey && e.key === "q") {
            ipcRenderer.sendSync('quitPressed', true);
        }
    },

    saveScreenShoot(e) {
        if (e.key === globalState.getConfig().keys.saveKey) {
            savePrintScreen();
        }
    },

    init() {
        this.escape = this.escape.bind(this);
        this.mousemove = this.mousemove.bind(this);
        this.keyUpClearScreen = this.keyUpClearScreen.bind(this);
        this.keyUpGuiHelp = this.keyUpGuiHelp.bind(this);
        this.keyUpTool = this.keyUpTool.bind(this);
        this.keyUpColor = this.keyUpColor.bind(this);
        this.wheelSize = this.wheelSize.bind(this);
        this.whiteBoard = this.whiteBoard.bind(this);
        this.showHideGui = this.showHideGui.bind(this);
        this.quit = this.quit.bind(this);
    }
};

functionsToBind.init();


class Control {
    constructor() {
        this.bindAllEvents();

        //nie do odpiecia - bardzo wazny :D
        document.addEventListener("mousemove", functionsToBind.mousemove);

        //TODO: poprawic to
        ipcRenderer.on('clearScreenFromMain' , function(event , data) {
            pubsub.emit("board-updateCanvas2");
            ipcRenderer.sendSync('afterClearAndToggleWindow', {});
        });
    }

    bindAllEvents() {
        document.addEventListener("keyup", functionsToBind.keyUpClearScreen);
        document.addEventListener("keyup", functionsToBind.keyUpTool);
        document.addEventListener("keyup", functionsToBind.keyUpColor);
        document.addEventListener("keyup", functionsToBind.whiteBoard);
        document.addEventListener("wheel", functionsToBind.wheelSize);
        document.addEventListener("keyup", functionsToBind.showHideGui);
        document.addEventListener("keyup", functionsToBind.keyUpGuiHelp);
        document.addEventListener("keyup", functionsToBind.escape);
        document.addEventListener("keyup", functionsToBind.quit);
        document.addEventListener("keyup", functionsToBind.saveScreenShoot);
    }

    unbindAllEvents() {
        document.removeEventListener("keyup", functionsToBind.keyUpClearScreen);
        document.removeEventListener("keyup", functionsToBind.keyUpTool);
        document.removeEventListener("keyup", functionsToBind.keyUpColor);
        document.removeEventListener("keyup", functionsToBind.whiteBoard);
        document.removeEventListener("wheel", functionsToBind.wheelSize);
        document.removeEventListener("keyup", functionsToBind.showHideGui);
        document.removeEventListener("keyup", functionsToBind.keyUpGuiHelp);
        document.removeEventListener("keyup", functionsToBind.escape);
        document.removeEventListener("keyup", functionsToBind.quit);
        document.removeEventListener("keyup", functionsToBind.saveScreenShoot);
    }
}

export default new Control();