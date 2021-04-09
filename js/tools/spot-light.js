import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class SpotLight {
    constructor() {
        this.name = "spotlight";
        this.idSubscribe = Symbol();

        components.board.disableSelection();

        this._size = 100;
        this._maxSize = 200;
        this._minSize = 100;

        pubsub.on("tool-size", this.idSubscribe, (e) => {
            this.changeZoom(e);
        });

        this.onMouseMove = this.onMouseMove.bind(this);

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();

        pubsub.off("tool-color", this.idSubscribe);
        pubsub.off("tool-size", this.idSubscribe);
        pubsub.off("tool-tool", this.idSubscribe);
    }

    bindEvents() {
        document.addEventListener("mousemove", this.onMouseMove);
    }

    unbindEvents() {
        document.removeEventListener("mousemove", this.onMouseMove);
    }

    changeZoom(e) {
        if (e.deltaY < 0) {
            this._size += 10;
            this._size = Math.min(this._size, this._maxSize);
        }
        if (e.deltaY > 0) {
            this._size -= 10;
            this._size = Math.max(this._size, this._minSize);
        }
    }

    onMouseMove(e) {
        components.board.clearCanvas2();
        components.board.ctx2.fillStyle = "rgba(0,0,0,0.8)";
        components.board.ctx2.fillRect(0, 0, components.board.canvas2.width, components.board.canvas2.height);
        components.board.ctx2.save();
        components.board.ctx2.beginPath();
        components.board.ctx2.arc(e.pageX, e.pageY, this._size, 0, 2 * Math.PI);
        components.board.ctx2.clip();
        components.board.clearCanvas2();
        components.board.ctx2.restore();
    }

}