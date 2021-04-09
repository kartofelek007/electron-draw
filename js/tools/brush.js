import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class Brush {
    constructor() {
        this.name = "brush";

        this.bindEvents();
        this.idSubscribe = Symbol();

        components.board.disableSelection();
        components.board.canvas.isDrawingMode = true;

        components.board.canvas.freeDrawingBrush.color = globalState.getColor();
        components.board.canvas.freeDrawingBrush.width = globalState.getSize();

        pubsub.on("tool-color", this.idSubscribe, () => {
            components.board.canvas.freeDrawingBrush.color = globalState.getColor();
        });

        pubsub.on("tool-size", this.idSubscribe, () => {
            components.board.canvas.freeDrawingBrush.width = globalState.getSize();
        });
    }

    destructor() {
        this.unbindEvents();
        components.board.canvas.isDrawingMode = false;

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

        components.board.clearCanvas2();
        components.board.ctx2.save();
        components.board.ctx2.lineCap = 'round';
        components.board.ctx2.fillStyle = globalState.getColor();
        components.board.ctx2.globalAlpha = 1;
        components.board.ctx2.beginPath();
        components.board.ctx2.arc(x, y, globalState.getSize() / 2, 0, 2 * Math.PI);
        components.board.ctx2.fill();
        components.board.ctx2.closePath();
        components.board.ctx2.restore();
    }
}
