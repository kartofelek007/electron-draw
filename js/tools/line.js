import globalState from "../global-state.js";
import board from "../board.js";
import Tool from "./tool.js";

export class Line extends Tool {
    constructor() {
        super();

        this._modifier = false;
        this.name = "line";
        this._startX = 0;
        this._startY = 0;
        this._line = null;
        this._draw = false;

        board.disableSelection();
    }

    changeToolSize() {
        if (this._line !== null) {
            this._line.set("strokeWidth", globalState.size);
            board.canvas.requestRenderAll();
        }
    }

    changeToolColor() {
        if (this._line !== null) {
            this._line.set("stroke", globalState.color);
            board.canvas.requestRenderAll();
        }
    }

    destructor() {
        super.destructor();
        this._line = null;
    }

    bindEvents() {
        document.addEventListener("mousemove", this.drawHelper);

        this.onKeyUp = this.onKeyUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        board.canvas.on("mouse:down", this.onMouseDown);
        board.canvas.on("mouse:move", this.onMouseMove);
        board.canvas.on("mouse:up", this.onMouseUp);


        document.addEventListener("keyup", this.onKeyUp);
        document.addEventListener("keydown", this.onKeyDown);
    }

    unbindEvents() {
        document.removeEventListener("mousemove", this.drawHelper);
        board.canvas.off("mouse:down", this.onMouseDown);
        board.canvas.off("mouse:move", this.onMouseMove);
        board.canvas.off("mouse:up", this.onMouseUp);

        document.removeEventListener("keyup", this.onKeyUp);
        document.removeEventListener("keydown", this.onKeyDown);
    }

    drawHelper(e) {
        const x = e.pageX;
        const y = e.pageY;

        board.clearCanvas2();

        if (this._draw) return;
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

    modifyFigureProperties() {
        if (this._line) {
            let dashed = false;
            if (this._modifier) {
                dashed = [globalState.size, globalState.size];
            }
            this._line.set({strokeDashArray : dashed});
            board.canvas.requestRenderAll();
        }
    }

    onMouseDown(o) {
        this._draw = true;

        const pointer = board.canvas.getPointer(o.e);
        this._startX = pointer.x;
        this._startY = pointer.y;

        const points = [pointer.x, pointer.y, pointer.x, pointer.y];
        this._line = new fabric.Line(points, {
            strokeWidth: globalState.size,
            fill: globalState.color,
            stroke: globalState.color,
            originX: 'center',
            originY: 'center'
        });
        board.canvas.add(this._line);

        this.modifyFigureProperties();
    }

    onMouseMove(o) {
        if (this._draw) {
            const pointer = board.canvas.getPointer(o.e);
            this._line.set({x2: pointer.x, y2: pointer.y});
            board.canvas.renderAll();
        }
    }

    onMouseUp(o) {
        const pointer = board.canvas.getPointer(o.e);
        let x = pointer.x;
        let y = pointer.y;

        if (Math.abs(this._startX - x) < 10 && Math.abs(this._startY - y) < 10) {
            board.canvas.remove(this._line);
        }

        this._draw = false;
        this._line = null;
    }

    onKeyUp(e) {
        super._onKeyUp(e);
    }

    onKeyDown(e) {
        super._onKeyDown(e);
    }
}