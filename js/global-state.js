import pubsub from "./pubsub.js";
import factoryTool from "./tools-factory.js";
import board from "./board.js";

const state = {
    color: "red",
    size: 10,
    sizeText: 10,
    tool: null,
    canChangeColor: true,
    canChangeSize: true,
    canChangeTool: true,

    mouse: {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0,
        mouseDown: false
    },

    config: {}
};

export default {
    //dla tekstu trzymam rozmiar w osobnej zmiennej
    //dzieki temu poprawia sie uzytecznosc tego narzedzia
    decreaseSize() {
        if (this.tool.name === "text") {
            this.sizeText = this.sizeText - this.config.size.step;
            this.sizeText = Math.max(this.sizeText, this.config.size.min);
        } else {
            this.size = this.size - this.config.size.step;
            this.size = Math.max(this.size, this.config.size.min);
        }
    },

    increaseSize() {
        if (this.tool.name === "text") {
            this.sizeText = this.sizeText + this.config.size.step;
            this.sizeText = Math.min(this.sizeText, this.config.size.max);
        } else {
            this.size = this.size + this.config.size.step;
            this.size = Math.min(this.size, this.config.size.max);
        }

    },

    get size() {
        return state.size;
    },

    set size(newSize) {
        state.size = newSize;
        pubsub.emit("tool-size", this.size)
    },

    get sizeText() {
        return state.sizeText;
    },

    set sizeText(newSize) {
        state.sizeText = newSize;
        pubsub.emit("tool-size", this.size)
    },

    set config(newConfig) {
        state.config = newConfig;
    },

    get config() {
        return state.config;
    },

    set color(newColor) {
        if (state.config.keys.colors.find(el => el.color === newColor)) {
            state.color = newColor;
            board.updateCanvas2();
            pubsub.emit("tool-color");
        }
    },

    get color() {
        return state.color;
    },

    set tool(name) {
        if (state.toolName !== name) {
            if (state.tool !== null) {
                pubsub.emit("board-clearCanvas2");
                state.tool.destructor();
            }

            state.tool = factoryTool.generateTool(name);
            pubsub.emit("tool-type");
        }
    },

    get tool() {
        return state.tool;
    },

    get mouse() {
        return state.mouse;
    },

    set canChangeColor(bool) {
        state.canChangeColor = bool;
    },

    get canChangeColor() {
        return state.canChangeColor;
    },

    set canChangeSize(bool) {
        state.canChangeSize = bool;
    },

    get canChangeSize() {
        return state.canChangeSize;
    },

    set canChangeTool(bool) {
        state.canChangeTool = bool;
    },

    get canChangeTool() {
        return state.canChangeTool;
    }
}
