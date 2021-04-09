import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class Arrow {
    constructor() {
        this.name = "arrow";

        components.board.disableSelection();

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
                components.board.canvas.requestRenderAll();
            }
        });

        pubsub.on("tool-color", this.idSubscribe, () => {
            if (this._line !== null) {
                this._line.set("stroke", globalState.getColor());
                components.board.canvas.requestRenderAll();
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

    unbindEvents() {
        document.removeEventListener("mousemove", this.drawHelper);
        components.board.canvas.off("mouse:down", this.onMouseDown);
        components.board.canvas.off("mouse:move", this.onMouseMove);
        components.board.canvas.off("mouse:up", this.onMouseUp);
    }

    bindEvents() {
        document.addEventListener("mousemove", this.drawHelper);
        components.board.canvas.on("mouse:down", this.onMouseDown);
        components.board.canvas.on("mouse:move", this.onMouseMove);
        components.board.canvas.on("mouse:up", this.onMouseUp);
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

    onMouseDown(o) {
        this._draw = true;

        const pointer = components.board.canvas.getPointer(o.e);
        this._startX = pointer.x;
        this._startY = pointer.y;

        const points = [pointer.x, pointer.y, pointer.x, pointer.y];

        this._line = new fabric.LineArrow(points, {
            strokeWidth: globalState.getSize(),
            stroke: globalState.getColor(),
            originX: 'center',
            originY: 'center',
            fill: "transparent",
            //perPixelTargetFind: true,
            movable: false,
            heads: [1, 0],
            selectable : false,
            objectCaching: false
        });

        components.board.canvas.add(this._line);
    }

    onMouseMove(o) {
        if (this._draw) {
            const pointer = components.board.canvas.getPointer(o.e);
            this._line.set({x2: pointer.x, y2: pointer.y});
            this._line.setCoords();
            components.board.canvas.renderAll();
        }
    }

    onMouseUp(o) {
        const pointer = components.board.canvas.getPointer(o.e);
        let x = pointer.x;
        let y = pointer.y;

        this._line.set({
            dirty: true,
            objectCaching: true
        });

        if (Math.abs(this._startX - x) < 10 && Math.abs(this._startY - y) < 10) {
            components.board.canvas.remove(this._line);
        }

        this._draw = false;
        this._line = null;
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