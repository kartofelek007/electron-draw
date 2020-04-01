import board from "../board.js";
import globalState from "../global-state.js";

export class SpotLight {
    constructor() {
        this.idSubscribe = Symbol();

        board.disableSelection();

        this._size = 100;
        this._maxSize = 200;
        this._minSize = 100;

        globalState.sizeSubscribers.subscribe(this.idSubscribe, (e) => {
            this.changeZoom(e);
        });

        this.onMouseMove = this.onMouseMove.bind(this);

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();

        if (globalState.colorSubscribers[this.idSubscribe]) delete globalState.colorSubscribers[this.idSubscribe];
        if (globalState.toolSubscribers[this.idSubscribe]) delete globalState.toolSubscribers[this.idSubscribe];
        if (globalState.sizeSubscribers[this.idSubscribe]) delete globalState.sizeSubscribers[this.idSubscribe];
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