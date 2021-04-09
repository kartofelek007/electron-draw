import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import board from "../board.js";

export class Line {
    constructor() {
        this.name = "line";

        board.disableSelection();

        this.idSubscribe = Symbol();
        this._startX = 0;
        this._startY = 0;
        this._line = null;
        this._draw = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        pubsub.on("tool-size", this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("strokeWidth", globalState.getSize());
                board.canvas.requestRenderAll();
            }
        });

        pubsub.on("tool-color", this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("stroke", globalState.getColor());
                board.canvas.requestRenderAll();
            }
        });

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();
        this._line = null;

        pubsub.off("tool-color", this.idSubscribe);
        pubsub.off("tool-size", this.idSubscribe);
        pubsub.off("tool-tool", this.idSubscribe);
    }

    bindEvents() {
        document.addEventListener("mousemove", this.drawHelper);
        board.canvas.on("mouse:down", this.onMouseDown);
        board.canvas.on("mouse:move", this.onMouseMove);
        board.canvas.on("mouse:up", this.onMouseUp);
    }

    unbindEvents() {
        document.removeEventListener("mousemove", this.drawHelper);
        board.canvas.off("mouse:down", this.onMouseDown);
        board.canvas.off("mouse:move", this.onMouseMove);
        board.canvas.off("mouse:up", this.onMouseUp);
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

    onMouseDown(o) {
        this._draw = true;

        const pointer = board.canvas.getPointer(o.e);
        this._startX = pointer.x;
        this._startY = pointer.y;

        const points = [pointer.x, pointer.y, pointer.x, pointer.y];
        this._line = new fabric.Line(points, {
            strokeWidth: globalState.getSize(),
            fill: globalState.getColor(),
            stroke: globalState.getColor(),
            originX: 'center',
            originY: 'center'
        });
        board.canvas.add(this._line);
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
}