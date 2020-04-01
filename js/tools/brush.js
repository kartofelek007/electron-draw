import board from "../board.js";
import globalState from "../global-state.js";

export class Brush {
    constructor() {
        this.bindEvents();
        this.idSubscribe = Symbol();

        board.disableSelection();
        board.canvas.isDrawingMode = true;

        board.canvas.freeDrawingBrush.color = globalState.color;
        board.canvas.freeDrawingBrush.width = globalState.size;

        globalState.colorSubscribers.subscribe(this.idSubscribe, () => {
            board.canvas.freeDrawingBrush.color = globalState.color;
        });

        globalState.sizeSubscribers.subscribe(this.idSubscribe, () => {
            board.canvas.freeDrawingBrush.width = globalState.size;
        });
    }

    destructor() {
        this.unbindEvents();

        board.canvas.isDrawingMode = false;
        if (globalState.colorSubscribers[this.idSubscribe]) delete globalState.colorSubscribers[this.idSubscribe];
        if (globalState.toolSubscribers[this.idSubscribe]) delete globalState.toolSubscribers[this.idSubscribe];
        if (globalState.sizeSubscribers[this.idSubscribe]) delete globalState.sizeSubscribers[this.idSubscribe];
    }

    bindEvents() {
        document.addEventListener("mousemove", this.drawHelper);
    }

    unbindEvents() {
        document.removeEventListener("mousemove", this.drawHelper);
    }

    drawHelper(e) {
        const x = e.pageX;
        const y = e.pageY;

        board.clearCanvas2();
        board.ctx2.save();
        board.ctx2.lineCap = 'round';
        board.ctx2.fillStyle = globalState.color;
        board.ctx2.globalAlpha = 1;
        board.ctx2.beginPath();
        board.ctx2.arc(x, y, globalState.size / 2, 0, 2 * Math.PI);
        board.ctx2.fill();
        board.ctx2.closePath();
        board.ctx2.restore();
    }
}
