import pubsub from "../pubsub.js";
import board from "../board.js";

export class SpotLight {
    constructor() {
        this.name = "spotlight";
        this.idSubscribe = Symbol();

        board.disableSelection();

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
        board.clearCanvas2();
        board.ctx2.fillStyle = "rgba(0,0,0,0.8)";
        board.ctx2.fillRect(0, 0, board.canvas2.width, board.canvas2.height);
        board.ctx2.save();
        board.ctx2.beginPath();
        board.ctx2.arc(e.pageX, e.pageY, this._size, 0, 2 * Math.PI);
        board.ctx2.clip();
        board.clearCanvas2();
        board.ctx2.restore();
    }

}