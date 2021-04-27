import pubsub from "../pubsub.js";

export default class Tool {
    constructor() {
        if (this.constructor === Tool) {
            throw new Error("Cannot construct Tool instances directly");
        }

        this.name = "";
        this._modifier = false;

        this.destructor = this.destructor.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.drawHelper = this.drawHelper.bind(this);
        this.changeToolSize = this.changeToolSize.bind(this);
        this.changeToolColor = this.changeToolColor.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        pubsub.on("tool-size", this.changeToolSize);
        pubsub.on("tool-color", this.changeToolColor);

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();

        pubsub.off("tool-size", this.changeToolSize);
        pubsub.off("tool-color", this.changeToolColor);
    }

    modifyFigureProperties() {}

    onMouseMove() {}

    onMouseDown() {}

    onMouseUp() {}

    drawHelper() {}

    bindEvents() {}

    unbindEvents() {}

    changeToolColor() {}

    changeToolSize() {}

    onKeyUp(e) {
        if (!e.ctrlKey) {
            this._modifier = false;
        }
        this.modifyFigureProperties();
    }

    onKeyDown(e) {
        if (e.ctrlKey) {
            this._modifier = true;
        }
        this.modifyFigureProperties();
    }
}