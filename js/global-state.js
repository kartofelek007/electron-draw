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
    decreaseSize() {
        if (this.getTool().name === "text") {
            this.setTextSize(this.getTextSize() - this.getConfig().size.step);
            if (this.getTextSize() < this.getConfig().size.min) {
                this.setTextSize(this.getConfig().size.min);
            }
        } else {
            this.setSize(this.getSize() - this.getConfig().size.step);
            if (this.getSize() < this.getConfig().size.min) {
                this.setSize(this.getConfig().size.min);
            }
        }
        pubsub.emit("tool-size", this.getSize())
    },

    increaseSize() {
        if (this.getTool().name === "text") {
            this.setTextSize(this.getTextSize() + this.getConfig().size.step);
            if (this.getTextSize() > this.getConfig().size.max) {
                this.setTextSize(this.getConfig().size.max);
            }
        } else {
            this.setSize(this.getSize() + this.getConfig().size.step);
            if (this.getSize() > this.getConfig().size.max) {
                this.setSize(this.getConfig().size.max);
            }
        }
        pubsub.emit("tool-size", this.getSize())
    },

    getSize() {
        return state.size;
    },

    setSize(newSize) {
        state.size = newSize;
        pubsub.emit("tool-size", this.getSize())
    },

    getTextSize() {
        return state.sizeText;
    },

    setTextSize(newSize) {
        state.sizeText = newSize;
    },

    setConfig(newConfig) {
        state.config = newConfig;
    },

    getConfig() {
        return state.config;
    },

    setColor(newColor) {
        if (state.config.keys.colors.find(el => el.color === newColor)) {
            state.color = newColor;
            board.updateCanvas2();
            pubsub.emit("tool-color");
        }
    },

    getColor() {
        return state.color;
    },

    setTool(name) {
        if (state.toolName !== name) {
            if (state.tool !== null) {
                pubsub.emit("board-clearCanvas2");
                state.tool.destructor();
            }

            state.tool = factoryTool.generateTool(name);
            pubsub.emit("tool-type");
        }
    },

    getTool() {
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
