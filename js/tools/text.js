import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import board from "../board.js";

export class Text {
    constructor() {
        this.name = "text";
        this.idSubscribe = Symbol();

        board.disableSelection();

        this.mouseDown = this.mouseDown.bind(this);
        this.pressEscape = this.pressEscape.bind(this);

        this.bindEvents();
        this._text = null;

        pubsub.on("tool-size", this.idSubscribe, () => {
            if (this._text !== null) {
                this._text.set('fontSize', globalState.getTextSize() + 20);
                board.canvas.requestRenderAll();
            }
        });
    }

    destructor() {
        this.unbindEvents();
        this._text = null;

        pubsub.off("tool-color", this.idSubscribe);
        pubsub.off("tool-size", this.idSubscribe);
        pubsub.off("tool-tool", this.idSubscribe);
    }

    bindEvents() {
        board.canvas.on("mouse:down", this.mouseDown);
        document.addEventListener("mousemove", this.drawHelper);
        document.addEventListener("keyup", this.pressEscape);
    }

    unbindEvents() {
        board.canvas.off("mouse:down", this.mouseDown);
        document.removeEventListener("mousemove", this.drawHelper);
        document.removeEventListener("keyup", this.pressEscape);
    }

    pressEscape(e) {
        if (e.key.toUpperCase() === "ESCAPE" && globalState.getTool().name !== "selection") {
            board.disableSelection();

            if (this._text) {
                const reg = /^\s$/g;
                if (reg.test(this._text.text)) {
                    board.canvas.remove(this._text);
                }
            }

            setTimeout(() => {
                globalState.canChangeSize = true;
                globalState.canChangeColor = true;
                globalState.canChangeTool = true;

                this._text = null;

            }, 0);
        }
    }

    drawHelper(e) {
        const x = e.pageX;
        const y = e.pageY;

        board.clearCanvas2();
        board.ctx2.save();
        board.ctx2.beginPath();
        board.ctx2.fillStyle = globalState.getColor();
        board.ctx2.globalAlpha = 1;
        board.ctx2.rect(x, y - ((globalState.getTextSize() + 20) / 2), 5, globalState.getTextSize() + 20);
        board.ctx2.fill();
        board.ctx2.closePath();
        board.ctx2.restore();
    }

    mouseDown(o) {
        const pointer = board.canvas.getPointer(o.e);

        this._text = new fabric.IText('text', {
            fontFamily: 'Open Sans',
            left: pointer.x,
            top: pointer.y - ((globalState.getTextSize() + 20) / 2),
            fontSize: globalState.getTextSize() + 20,
            fontWeight: 600,
            fill: globalState.getColor(),
            fontStyle: 'normal',
            cursorDuration: 500,
            cursorWidth: 5,
            padding: 5
        });

        globalState.canChangeSize = false;
        globalState.canChangeColor = false;
        globalState.canChangeTool = false;

        board.canvas.add(this._text);
        board.canvas.setActiveObject(this._text);

        this._text.on("editing:entered", o => {
            globalState.canChangeSize = false;
            globalState.canChangeColor = false;
            globalState.canChangeTool = false;
        });

        this._text.on("editing:exited", o => {
            if (globalState.toolName === "selection") {
                globalState.canChangeSize = true;
                globalState.canChangeColor  = true;
                globalState.canChangeTool  = true;
            }
        });

        this._text.enterEditing();
        this._text.selectAll();
    }


}