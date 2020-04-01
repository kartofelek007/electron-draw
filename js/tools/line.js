import board from "../board.js";
import globalState from "../global-state.js";

export class Line {
    constructor() {
        board.disableSelection();

        this.idSubscribe = Symbol();
        this._startX = 0;
        this._startY = 0;
        this._line = null;
        this._draw = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        globalState.sizeSubscribers.subscribe(this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("strokeWidth", globalState.size);
                board.canvas.requestRenderAll();
            }
        });

        globalState.colorSubscribers.subscribe(this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("stroke", globalState.color);
                board.canvas.requestRenderAll();
            }
        });

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();

        if (globalState.colorSubscribers[this.idSubscribe]) delete globalState.colorSubscribers[this.idSubscribe];
        if (globalState.toolSubscribers[this.idSubscribe]) delete globalState.toolSubscribers[this.idSubscribe];
        if (globalState.sizeSubscribers[this.idSubscribe]) delete globalState.sizeSubscribers[this.idSubscribe];
        this._line = null;
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
        board.ctx2.fillStyle = globalState.color;
        board.ctx2.globalAlpha = 1;
        board.ctx2.beginPath();
        board.ctx2.arc(x, y, globalState.size/2, 0, 2 * Math.PI);
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
            strokeWidth: globalState.size,
            fill: globalState.color,
            stroke: globalState.color,
            originX: 'center',
            originY: 'center'
        });
        board.canvas.add(this._line);
    }

    onMouseMove(o) {
        if (this._draw) {
          const pointer = board.canvas.getPointer(o.e);
          this._line.set({ x2: pointer.x, y2: pointer.y });
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