import pubsub from "./pubsub.js";
import globalState from "./global-state.js";

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
                pubsub.emit("board-clearCanvas1");
            }
        }
    },

    keyUpTool(e) {
        const keys = globalState.config.keys.tools.map(el => el.key);

        if (globalState.canChangeTool) {
            if (keys.includes(e.key)) {
                globalState.config.keys.tools.forEach(el => {
                    if (e.key === el.key) {
                        globalState.tool = el.tool;
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
                    }
                });
            }
        }
    },

    wheelSize(e) {
        if (globalState.canChangeSize) {
            //FIXME : tutaj trzeba inaczej rozegrać
            //wynika to z faktu
            //ze jak zaznaczymy za pomocą selection
            //kilka kształtów to każdy z nich ma inny wymiar
            //więc zwracanie tylko rozmiaru narzędzia to za malo
            //bo musze wiedziec czy zwiekszam czy zmniejszam rozmiar narzedzi
            if (globalState.tool.name !== "selection") {
                if (e.deltaY > 0) globalState.decreaseSize(e);
                if (e.deltaY < 0) globalState.increaseSize(e);
            } else {
                pubsub.emit("tool-size", e);
            }
        }
    },

    whiteBoard(e) {
        if (globalState.canChangeTool && globalState.canChangeColor) {
            if (e.key === globalState.config.keys.whiteBoard && !metaKeysPress(e)) {
                document.body.classList.toggle("white-board-mode");
                pubsub.emit("white-board", document.body.classList.contains("white-board-mode"))
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

    init() {
        this.mousemove = this.mousemove.bind(this);
        this.keyUpClearScreen = this.keyUpClearScreen.bind(this);
        this.keyUpTool = this.keyUpTool.bind(this);
        this.keyUpColor = this.keyUpColor.bind(this);
        this.wheelSize = this.wheelSize.bind(this);
        this.whiteBoard = this.whiteBoard.bind(this);
        this.showHideGui = this.showHideGui.bind(this);
    }
};

functionsToBind.init();


class Control {
    constructor() {
        this.bindAllEvents();
        document.addEventListener("mousemove", functionsToBind.mousemove);
    }

    bindAllEvents() {
        document.addEventListener("keyup", functionsToBind.keyUpClearScreen);
        document.addEventListener("keyup", functionsToBind.keyUpTool);
        document.addEventListener("keyup", functionsToBind.keyUpColor);
        document.addEventListener("keyup", functionsToBind.whiteBoard);
        document.addEventListener("wheel", functionsToBind.wheelSize);
        document.addEventListener("keyup", functionsToBind.showHideGui);
    }

    unbindAllEvents() {
        document.removeEventListener("keyup", functionsToBind.keyUpClearScreen);
        document.removeEventListener("keyup", functionsToBind.keyUpTool);
        document.removeEventListener("keyup", functionsToBind.keyUpColor);
        document.removeEventListener("keyup", functionsToBind.whiteBoard);
        document.removeEventListener("wheel", functionsToBind.wheelSize);
        document.removeEventListener("keyup", functionsToBind.showHideGui);
    }
}

export default new Control();