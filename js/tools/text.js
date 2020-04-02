import globalState from "../global-state.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class Text {
    constructor() {
        this.idSubscribe = Symbol();

        components.board.disableSelection();

        this.mouseDown = this.mouseDown.bind(this);
        this.bindEvents();
        this._text = null;

        pubsub.subscribe("tool-size", this.idSubscribe, () => {
            if (this._text !== null) {
                this._text.set('fontSize', globalState.size + 20);
                components.board.canvas.requestRenderAll();
            }
        });
    }

    destructor() {
        this.unbindEvents();
        this._text = null;

        pubsub.unsubscribe("tool-color", this.idSubscribe);
        pubsub.unsubscribe("tool-size", this.idSubscribe);
        pubsub.unsubscribe("tool-tool", this.idSubscribe);    }

    bindEvents() {
        components.board.canvas.on("mouse:down", this.mouseDown);
        document.addEventListener("mousemove", this.drawHelper);
    }

    unbindEvents() {
        components.board.canvas.off("mouse:down", this.mouseDown);
        document.removeEventListener("mousemove", this.drawHelper);
    }

    drawHelper(e) {
        const x = e.pageX;
        const y = e.pageY;

        components.board.clearCanvas2();
        components.board.ctx2.save();
        components.board.ctx2.beginPath();
        components.board.ctx2.fillStyle = globalState.color;
        components.board.ctx2.globalAlpha = 1;
        components.board.ctx2.rect(x, y - ((globalState.size + 20) / 2), 5, globalState.size + 20);
        components.board.ctx2.fill();
        components.board.ctx2.closePath();
        components.board.ctx2.restore();
    }

    mouseDown(o) {
        const pointer = components.board.canvas.getPointer(o.e);

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

        components.board.canvas.add(this._text);
        components.board.canvas.setActiveObject(this._text);

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
                components.board.disableSelection();
            }

            if (this._text) {
                const reg = /^\s$/g;
                if (reg.test(this._text.text)) {
                    components.board.canvas.remove(this._text);
                }
            }
        });
        
        this._text.on("editing:entered", o => {
            globalState.canChangeSize = false;
            globalState.canChangeColor = false;
            globalState.canChangeTool = false;

            if (globalState.toolName !== "selection") {
                components.board.disableSelection();
            }
        });

    }


}