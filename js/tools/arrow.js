import globalState from "../global-state.js";
import board from "../board.js";
import Tool from "./tool.js";

export class Arrow extends Tool {
    constructor() {
        super();

        this.name = "arrow";
        this._modifier = false;
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
            let heads = [1, 0];
            if (this._modifier) {
                heads = [0, 1];
            }

            this._line.set({heads : heads});
            board.canvas.requestRenderAll();
        }
    }

    onMouseDown(o) {
        this._draw = true;

        const pointer = board.canvas.getPointer(o.e);
        this._startX = pointer.x;
        this._startY = pointer.y;

        const points = [pointer.x, pointer.y, pointer.x, pointer.y];

        this._line = new fabric.LineArrow(points, {
            strokeWidth: globalState.size,
            stroke: globalState.color,
            originX: 'center',
            originY: 'center',
            fill: "transparent",
            //perPixelTargetFind: true,
            movable: false,
            heads: this._modifier ? [0, 1] : [1, 0],
            selectable : false,
            objectCaching: false
        });

        this.modifyFigureProperties();

        console.log(this._modifier);

        board.canvas.add(this._line);
    }

    onMouseMove(o) {
        if (this._draw) {
            const pointer = board.canvas.getPointer(o.e);
            this._line.set({x2: pointer.x, y2: pointer.y});
            this._line.setCoords();
            board.canvas.renderAll();
        }
    }

    onMouseUp(o) {
        const pointer = board.canvas.getPointer(o.e);
        let x = pointer.x;
        let y = pointer.y;

        this._line.set({
            dirty: true,
            objectCaching: true
        });

        if (Math.abs(this._startX - x) < 10 && Math.abs(this._startY - y) < 10) {
            board.canvas.remove(this._line);
        }

        this._draw = false;
        this._line = null;
    }

    onKeyUp(e) {
        if (!e.ctrlKey) {
            this._modifier = false;
        }
        this.modifyFigureProperties();
    }

    onKeyDown(e) {
        if (e.ctrlKey) {
            this._modifier = true;
        }
        this.modifyFigureProperties();
    }
}

fabric.LineArrow = fabric.util.createClass(fabric.Line, {
    type: 'lineArrow',

    initialize(element, options) {
        options || (options = {});
        this.callSuper('initialize', element, options);
    },

    toObject() {
        return fabric.util.object.extend(this.callSuper('toObject'));
    },

    _render(ctx) {
        this.ctx = ctx;
        this.callSuper('_render', ctx);
        const p = this.calcLinePoints();
        let xDiff = this.x2 - this.x1;
        let yDiff = this.y2 - this.y1;
        let angle = Math.atan2(yDiff, xDiff);
        this._drawArrow(angle, p.x2, p.y2, this.heads[0]);
        this.ctx.save();
        xDiff = -this.x2 + this.x1;
        yDiff = -this.y2 + this.y1;
        angle = Math.atan2(yDiff, xDiff);
        this._drawArrow(angle, p.x1, p.y1, this.heads[1]);
    },

    _drawArrow(angle, xPos, yPos, head) {
        this.ctx.save();

        if (head) {
            this.ctx.translate(xPos, yPos);
            this.ctx.rotate(angle);
            this.ctx.beginPath();
            const size = this.strokeWidth;
            this.ctx.moveTo(size + 10, 0);
            this.ctx.lineTo(-(size + 10), (size + 10));
            this.ctx.lineTo(-(size + 10), -(size + 10));
            this.ctx.closePath();
        }

        this.ctx.fillStyle = this.stroke;
        this.ctx.fill();
        this.ctx.restore();
    }
});

fabric.LineArrow.fromObject = function(object, callback) {
    callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};

fabric.LineArrow.async = true;