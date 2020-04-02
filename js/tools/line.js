import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class Line {
    constructor() {
        components.board.disableSelection();

        this.idSubscribe = Symbol();
        this._startX = 0;
        this._startY = 0;
        this._line = null;
        this._draw = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        pubsub.subscribe("tool-size", this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("strokeWidth", globalState.size);
                components.board.canvas.requestRenderAll();
            }
        });

        pubsub.subscribe("tool-color", this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("stroke", globalState.color);
                components.board.canvas.requestRenderAll();
            }
        });

        this.bindEvents();
    }

    destructor() {
        this.unbindEvents();
        this._line = null;

        pubsub.unsubscribe("tool-color", this.idSubscribe);
        pubsub.unsubscribe("tool-size", this.idSubscribe);
        pubsub.unsubscribe("tool-tool", this.idSubscribe);
    }

    bindEvents() {
        document.addEventListener("mousemove", this.drawHelper);
        components.board.canvas.on("mouse:down", this.onMouseDown);
        components.board.canvas.on("mouse:move", this.onMouseMove);
        components.board.canvas.on("mouse:up", this.onMouseUp);
    }

    unbindEvents() {
        document.removeEventListener("mousemove", this.drawHelper);
        components.board.canvas.off("mouse:down", this.onMouseDown);
        components.board.canvas.off("mouse:move", this.onMouseMove);
        components.board.canvas.off("mouse:up", this.onMouseUp);
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
        components.board.ctx2.arc(x, y, globalState.size/2, 0, 2 * Math.PI);
        components.board.ctx2.fill();
        components.board.ctx2.closePath();
        components.board.ctx2.restore();
    }

    onMouseDown(o) {
        this._draw = true;

        const pointer = components.board.canvas.getPointer(o.e);
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
        components.board.canvas.add(this._line);
    }

    onMouseMove(o) {
        if (this._draw) {
          const pointer = components.board.canvas.getPointer(o.e);
          this._line.set({ x2: pointer.x, y2: pointer.y });
          components.board.canvas.renderAll();
        }
    }

    onMouseUp(o) {
        const pointer = components.board.canvas.getPointer(o.e);
        let x = pointer.x;
        let y = pointer.y;

        if (Math.abs(this._startX - x) < 10 && Math.abs(this._startY - y) < 10) {
            components.board.canvas.remove(this._line);
        }
        
        this._draw = false;
        this._line = null;
    }
}