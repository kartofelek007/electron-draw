import globalState from "../global-state.js";
import {hexToRGBA} from "../utils/colors.js";
import board from "../board.js";
import Tool from "./tool.js";

export class Rectangle extends Tool {
    constructor() {
        super();

        this.name = "rectangle";
        this._modifier = false;
        this._startX = 0;
        this._startY = 0;
        this._rect = null;
        this._draw = false;

        board.disableSelection();
    }

    changeToolSize() {
        if (this._rect !== null) {
            this._rect.set("strokeWidth", globalState.size);
            board.canvas.requestRenderAll();
        }
    }

    changeToolColor() {
        if (this._rect !== null) {
            this._rect.set("stroke", globalState.color);
            board.canvas.requestRenderAll();
        }
    }

    destructor() {
        super.destructor();
        this._rect = null;
    }

    bindEvents() {
        document.addEventListener("mousemove", this.drawHelper);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        board.canvas.on("mouse:down", this.onMouseDown);
        board.canvas.on("mouse:move", this.onMouseMove);
        board.canvas.on("mouse:up", this.onMouseUp);

        this.onKeyUp = this.onKeyUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        document.addEventListener("keyup", this.onKeyUp);
        document.addEventListener("keydown", this.onKeyDown);
    }

    unbindEvents() {
        document.removeEventListener("mousemove", this.drawHelper);
        board.canvas.off("mouse:down", this.onMouseDown);
        board.canvas.off("mouse:move", this.onMouseMove);
        board.canvas.off("mouse:up", this.onMouseUp);

        document.removeEventListener("onMouseDown", this.onMouseDown);
        document.removeEventListener("onMouseMove", this.onMouseMove);
        document.removeEventListener("onMouseUp", this.onMouseUp);

        document.removeEventListener("keyup", this.onKeyUp);
        document.removeEventListener("keydown", this.onKeyDown);
    }

    drawHelper(e) {
        const x = e.pageX - globalState.size / 2;
        const y = e.pageY - globalState.size / 2;

        board.clearCanvas2();
        board.ctx2.save();
        board.ctx2.beginPath();
        board.ctx2.fillStyle = globalState.color;
        board.ctx2.globalAlpha = 1;
        board.ctx2.lineCap = 'square';
        board.ctx2.fillRect(x, y, globalState.size, globalState.size);
        board.ctx2.closePath();
        board.ctx2.restore();
    }

    modifyFigureProperties() {
        if (this._rect) {
            let fillColor = "transparent";

            if (this._modifier) {
                if (hexToRGBA(globalState.color, 0.7)) {
                    fillColor = hexToRGBA(globalState.color, 0.7);
                }
            }

            this._rect.set({fill : fillColor});
            board.canvas.requestRenderAll();
        }
    }

    onKeyUp(e) {
        super._onKeyUp(e);
    }

    onKeyDown(e) {
        super._onKeyDown(e);
    }

    onMouseDown(o) {
        this._draw = true;
        const pointer = board.canvas.getPointer(o.e);

        this._startX = Math.floor(pointer.x - globalState.size / 2);
        this._startY = Math.floor(pointer.y - globalState.size / 2);

        this._rect = new fabric.Rect({
            left: this._startX,
            top: this._startY,
            originX: 'left',
            originY: 'top',
            width:  0,
            height: 0,
            angle: 0,
            movable: false,
            transparentCorners: false,
            hasBorders: true,
            hasControls: true,
            selectable : false,
            strokeUniform: false,
            color: globalState.color,
            strokeWidth : globalState.size,
            stroke : globalState.color,
        });

        this.modifyFigureProperties();

        board.canvas.add(this._rect);
    }

    onMouseMove(o) {
        if (this._draw) {
            const pointer = board.canvas.getPointer(o.e);

            let x = pointer.x;
            let y = pointer.y;

            if (x < 0) x = 0;
            if (x > screen.width) x = screen.width;
            if (y < 0) y = 0;
            if (y > screen.height) y = screen.height;

            const minX = Math.floor(Math.min(x - globalState.size / 2, this._startX));
            const minY = Math.floor(Math.min(y - globalState.size / 2, this._startY));
            const maxX = Math.floor(Math.max(x, this._startX));
            const maxY = Math.floor(Math.max(y, this._startY));

            this._rect.set({left: minX});
            this._rect.set({top:  minY});

            let width = Math.floor(maxX - minX - globalState.size / 2);
            if (width === 0) width = 1;
            let height = Math.floor(maxY - minY - globalState.size / 2);
            if (height === 0) height = 1;

            this._rect.set({width: width });
            this._rect.set({height: height });

            board.canvas.requestRenderAll();
        }
    }

    onMouseUp(o) {
        this._draw = false;
        const pointer = board.canvas.getPointer(o.e);
        let x = pointer.x - globalState.size / 2;
        let y = pointer.y - globalState.size / 2;

        if (Math.abs(this._startX - x) < 5 || Math.abs(this._startY - y) < 5) {
            board.canvas.remove(this._rect);
        }
        this._rect = null;
    }
}