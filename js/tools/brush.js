import globalState from "../global-state.js";
import board from "../board.js";
import Tool from "./tool.js";

export class Brush extends Tool {
    constructor() {
        super();

        this.name = "brush";

        board.disableSelection();
        board.canvas.isDrawingMode = true;

        board.canvas.freeDrawingBrush.color = globalState.color;
        board.canvas.freeDrawingBrush.width = globalState.size;
    }

    changeToolSize() {
        board.canvas.freeDrawingBrush.width = globalState.size;
    }

    changeToolColor() {
        board.canvas.freeDrawingBrush.color = globalState.color;
    }

    destructor() {
        super.destructor();
        board.canvas.isDrawingMode = false;
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
