import config from "./config.js";

export default {
    color: "red",
    size: 10,
    toolName : null,
    tool : null,
    canChangeColor : true,
    canChangeSize : true,
    canChangeTool : true,

    mouse: {
        x: 0,
        y: 0,
        startX : 0,
        startY : 0,
        mouseDown : false
    },

    decreaseWidth() {
        this.size -= config.size.step;
        if (this.size < config.size.min) {
            this.size = config.size.min;
        }
    },

    increaseWidth() {
        this.size += config.size.step;
        if (this.size > config.size.max) {
            this.size = config.size.max;
        }
    },

    toolSubscribers: {
        subscribers : new Map(),
        subscribe(id, fn) {
            this.subscribers.set(id, fn);
        },
        emit() {
            for (const [key, value] of this.subscribers.entries()) {
                value();
            }
        }
    },

    colorSubscribers: {
        subscribers : new Map(),
        subscribe(id, fn) {
            this.subscribers.set(id, fn);
        },
        emit() {
            for (const [key, value] of this.subscribers.entries()) {
                value();
            }
        }
    },

    sizeSubscribers: {
        subscribers : new Map(),
        subscribe(id, fn) {
            this.subscribers.set(id, fn);
        },
        emit(e) {
            for (const [key, value] of this.subscribers.entries()) {
                value(e);
            }
        }
    },
}