import pubsub from "../pubsub.js";

export default class Tool {
    constructor() {
        if (this.constructor === Tool) {
            throw new Error("Cannot construct Tool instances directly");
        }

        this.name = "";
        this._modifier = false;

        this.destructor = this.destructor.bind(this);
        this.drawHelper = this.drawHelper.bind(this);
        this.changeToolSize = this.changeToolSize.bind(this);
        this.changeToolColor = this.changeToolColor.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

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

    drawHelper() {}

    bindEvents() {}

    unbindEvents() {}

    changeToolColor() {}

    changeToolSize() {}

    _onKeyUp(e) {
        if (!e.ctrlKey) {
            this._modifier = false;
        }
        this.modifyFigureProperties();
    }

    _onKeyDown(e) {
        if (e.ctrlKey) {
            this._modifier = true;
        }
        this.modifyFigureProperties();
    }
}