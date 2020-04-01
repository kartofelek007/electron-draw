import board from "../board.js";
import globalState from "../global-state.js";

export class Text {
    constructor() {
        this.idSubscribe = Symbol();

        board.disableSelection();

        this.mouseDown = this.mouseDown.bind(this);
        this.bindEvents();
        this._text = null;

        globalState.sizeSubscribers.subscribe(this.idSubscribe, () => {
            if (this._text !== null) {
                this._text.set('fontSize', globalState.size + 20);
                board.canvas.requestRenderAll();
            }
        });
    }

    destructor() {
        this.unbindEvents();
        this._text = null;
        if (globalState.colorSubscribers[this.idSubscribe]) delete globalState.colorSubscribers[this.idSubscribe];
        if (globalState.toolSubscribers[this.idSubscribe]) delete globalState.toolSubscribers[this.idSubscribe];
        if (globalState.sizeSubscribers[this.idSubscribe]) delete globalState.sizeSubscribers[this.idSubscribe];
    }

    bindEvents() {
        board.canvas.on("mouse:down", this.mouseDown);
        document.addEventListener("mousemove", this.drawHelper);
    }

    unbindEvents() {
        board.canvas.off("mouse:down", this.mouseDown);
        document.removeEventListener("mousemove", this.drawHelper);
    }

    drawHelper(e) {
        const x = e.pageX;
        const y = e.pageY;

        board.clearCanvas2();
        board.ctx2.save();
        board.ctx2.beginPath();
        board.ctx2.fillStyle = globalState.color;
        board.ctx2.globalAlpha = 1;
        board.ctx2.rect(x, y - ((globalState.size + 20) / 2), 5, globalState.size + 20);
        board.ctx2.fill();
        board.ctx2.closePath();
        board.ctx2.restore();
    }

    mouseDown(o) {
        const pointer = board.canvas.getPointer(o.e);

        this._text = new fabric.IText('text', {
            fontFamily: 'Open Sans',
            left: pointer.x,
            top: pointer.y - ((globalState.size + 20) / 2),
            fontSize: globalState.size + 20,
            fontWeight: 600,
            fill: globalState.color,
            fontStyle: 'normal',
            cursorDuration: 500,
            cursorWidth: 5
        });

        globalState.canChangeSize = false;
        globalState.canChangeColor = false;
        globalState.canChangeTool = false;

        board.canvas.add(this._text);
        board.canvas.setActiveObject(this._text);

        this._text.enterEditing();
        this._text.selectAll();

        this._text.setSelectionStart(0);
        this._text.setSelectionEnd(0);

        this._text.padding = 5;

        this._text.on("editing:exited", o => {
            setTimeout(() => {
                globalState.canChangeSize = true;
                globalState.canChangeColor = true;
                globalState.canChangeTool = true;
                this._text = null;
            }, 300);

            if (globalState.toolName !== "selection") {
                board.disableSelection();
            }

            if (this._text) {
                const reg = /^\s$/g;
                if (reg.test(this._text.text)) {
                    board.canvas.remove(this._text);
                }
            }
        });
        
        this._text.on("editing:entered", o => {
            globalState.canChangeSize = false;
            globalState.canChangeColor = false;
            globalState.canChangeTool = false;

            if (globalState.toolName !== "selection") {
                board.disableSelection();
            }
        });

    }


}