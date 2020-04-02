import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class Brush {
    constructor() {
        this.bindEvents();
        this.idSubscribe = Symbol();

        components.board.disableSelection();
        components.board.canvas.isDrawingMode = true;

        components.board.canvas.freeDrawingBrush.color = globalState.color;
        components.board.canvas.freeDrawingBrush.width = globalState.size;

        pubsub.subscribe("tool-color", this.idSubscribe, () => {
            components.board.canvas.freeDrawingBrush.color = globalState.color;
        });

        pubsub.subscribe("tool-size", this.idSubscribe, () => {
            components.board.canvas.freeDrawingBrush.width = globalState.size;
        });
    }

    destructor() {
        this.unbindEvents();
        components.board.canvas.isDrawingMode = false;

        pubsub.unsubscribe("tool-color", this.idSubscribe);
        pubsub.unsubscribe("tool-size", this.idSubscribe);
        pubsub.unsubscribe("tool-tool", this.idSubscribe);
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
        components.board.ctx2.fillStyle = globalState.color;
        components.board.ctx2.globalAlpha = 1;
        components.board.ctx2.beginPath();
        components.board.ctx2.arc(x, y, globalState.size / 2, 0, 2 * Math.PI);
        components.board.ctx2.fill();
        components.board.ctx2.closePath();
        components.board.ctx2.restore();
    }
}
