import pubsub from "../pubsub.js";

export default class Tool {
    constructor() {
        if (this.constructor === Tool) {
            throw new Error("Cannot construct Tool instances directly");
        }

        this.name = "";
        this.destructor = this.destructor.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.drawHelper = this.drawHelper.bind(this);
        this.changeToolSize = this.changeToolSize.bind(this);
        this.changeToolColor = this.changeToolColor.bind(this);

        pubsub.on("tool-size", this.changeToolSize);
        pubsub.on("tool-color", this.changeToolColor);

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();

        pubsub.off("tool-size", this.changeToolSize);
        pubsub.off("tool-color", this.changeToolColor);
    }

    onMouseMove() {
        throw "Method onMouseMove() should be overwritten";
    }

    onMouseDown() {
        throw "Method onMouseDown() should be overwritten";
    }

    onMouseUp() {
        throw "Method onMouseUp() should be overwritten";
    }

    drawHelper() {
        throw "Method drawHelper() should be overwritten";
    }

    bindEvents() {
        throw "Method bindEvents() should be overwritten";
    }

    unbindEvents() {
        throw "Method unbindEvents() should be overwritten";
    }

    changeToolColor() {
        throw "Method changeToolColor() should be overwritten";
    }

    changeToolSize() {
        throw "Method changeToolSize() should be overwritten";
    }
}