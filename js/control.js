import pubsub from "./pubsub.js";
import globalState from "./global-state.js";
import storage from "./utils/localStorage.js";
import { savePrintScreen } from "./utils/savePrintScreen.js";
const { ipcRenderer } = require('electron');
import components from "./componets.js";

function metaKeysPress(e) {
    return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey
}

const functionsToBind = {
    mousemove(e) {
        globalState.mouse.x = e.pageX;
        globalState.mouse.y = e.pageY;
    },

    keyUpClearScreen(e) {
        if (globalState.canChangeTool && globalState.canChangeColor) {
            if (e.key.toLowerCase() === globalState.config.keys.clearScreen && !metaKeysPress(e)) {
                pubsub.publish("board-clearCanvas1");
            }
        }
    },

    keyUpGuiHelp(e) {
        if (e.key === "?" && metaKeysPress(e) && globalState.canChangeColor && globalState.canChangeSize && globalState.canChangeTool) {
            pubsub.publish("gui-toggleHelpKey");
        }
    },

    keyUpTool(e) {
        const keys = globalState.config.keys.tools.map(el => el.key);
        if (globalState.canChangeTool) {
            if (keys.includes(e.key)) {
                globalState.config.keys.tools.forEach(el => {
                    if (e.key === el.key) {
                        components.tools.setTool(el.tool);
                        pubsub.publish("tool-type");
                    }
                });
            }
        }
    },

    keyUpColor(e) {
        const keys = globalState.config.keys.colors.map(el => el.key);
        if (globalState.canChangeColor) {
            if (keys.includes(e.key)) {
                globalState.config.keys.colors.forEach(el => {
                    if (e.key === el.key && !metaKeysPress(e)) {
                        globalState.color = el.color;
                        pubsub.publish("tool-color");
                    }
                });

            }
        }
    },

    wheelSize(e) {
        if (globalState.canChangeSize) {
            if (!["spot"].includes(globalState.toolName)) {
                if (e.deltaY > 0) globalState.decreaseWidth();
                if (e.deltaY < 0) globalState.increaseWidth();
            }
            pubsub.publish("tool-size", e);
        }
    },

    whiteBoard(e) {
        if (globalState.canChangeTool && globalState.canChangeColor) {
            if (e.key === globalState.config.keys.whiteBoard && !metaKeysPress(e)) {
                document.body.classList.toggle("white-board-mode");
            }
        }
    },

    showHideGui(e) {
        if (globalState.canChangeTool && globalState.canChangeColor && globalState.canChangeSize) {
            if (e.key === '`') {
                pubsub.publish("gui-hide");
            }
        }
    },

    escape(e) {
        if (e.key.toUpperCase() === "ESCAPE" && globalState.canChangeTool) {
            pubsub.publish("board-clearCanvas1");

            setTimeout(() => {
                if (globalState.tool !== null) {
                    pubsub.publish("board-clearCanvas2");
                    globalState.tool.destructor();
                }

                components["tools"].generateTool("brush");
                pubsub.publish("tool-type");

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
        if (e.key === globalState.config.keys.saveKey) {
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
            pubsub.publish("board-updateCanvas2");
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

export default Control;