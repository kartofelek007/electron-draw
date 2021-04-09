import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import board from "../board.js";

export class Brush {
    constructor() {
        this.name = "brush";

        this.bindEvents();
        this.idSubscribe = Symbol();

        board.disableSelection();
        board.canvas.isDrawingMode = true;

        board.canvas.freeDrawingBrush.color = globalState.getColor();
        board.canvas.freeDrawingBrush.width = globalState.getSize();

        pubsub.on("tool-color", this.idSubscribe, () => {
            board.canvas.freeDrawingBrush.color = globalState.getColor();
        });

        pubsub.on("tool-size", this.idSubscribe, () => {
            board.canvas.freeDrawingBrush.width = globalState.getSize();
        });
    }

    destructor() {
        this.unbindEvents();
        board.canvas.isDrawingMode = false;

        pubsub.off("tool-color", this.idSubscribe);
        pubsub.off("tool-size", this.idSubscribe);
        pubsub.off("tool-tool", this.idSubscribe);
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
        board.ctx2.fillStyle = globalState.getColor();
        board.ctx2.globalAlpha = 1;
        board.ctx2.beginPath();
        board.ctx2.arc(x, y, globalState.getSize() / 2, 0, 2 * Math.PI);
        board.ctx2.fill();
        board.ctx2.closePath();
        board.ctx2.restore();
    }
}
