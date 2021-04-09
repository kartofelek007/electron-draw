import globalState from "./global-state.js";
import pubsub from "./pubsub.js";

class Board {
    constructor() {
        const el = document.querySelector("#main");
        this.canvas = new fabric.Canvas(el, {
            preserveObjectStacking: true
        });
        this.canvas.setHeight(window.innerHeight);
        this.canvas.setWidth(window.innerWidth);
        this.container = el.parentElement;
        this.canvas.selectionBorderColor = "rgba(21,144,227, 1)";
        this.canvas.selectionColor = "rgba(21,144,227, 0.05)";
        this.canvas.selectionLineWidth = 2;
        this.canvas.freeDrawingCursor = "none";
        fabric.minCacheSideLimit = 256 * 4;

        this.createSecondCanvas();
        this.cursorHidden();

        this.clearCanvas1 = this.clearCanvas1.bind(this);
        this.clearCanvas2 = this.clearCanvas2.bind(this);
        this.updateCanvas2 = this.updateCanvas2.bind(this);

        pubsub.on("board-clearCanvas1", this.clearCanvas1);
        pubsub.on("board-clearCanvas2", this.clearCanvas2);
        pubsub.on("board-updateCanvas2", this.updateCanvas2);

        pubsub.on("tool-type", this.updateCanvas2);
        pubsub.on("tool-color", this.updateCanvas2);
        pubsub.on("tool-size", this.updateCanvas2);
    }

    cursorHidden() {
        this.container.classList.remove("default")
    }

    cursorDefault() {
        this.container.classList.add("default")
    }

    createSecondCanvas() {
        this.canvas2 = document.createElement("canvas");
        this.canvas2.id = "second";
        this.canvas2.width = window.innerWidth;
        this.canvas2.height = window.innerHeight;
        this.ctx2 = this.canvas2.getContext("2d");
        document.body.appendChild(this.canvas2);
    }

    clearCanvas2() {
        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
    }

    clearCanvas1() {
        this.canvas.discardActiveObject();
        this.canvas.remove(...this.canvas.getObjects());
        this.canvas.renderAll();
    }

    updateCanvas2() {
        console.log(globalState.getMouse());
        document.dispatchEvent(new MouseEvent("mousemove", {
            clientX : globalState.getMouse().x,
            clientY : globalState.getMouse().y
        }))
    }

    disableSelection() {
        this.canvas.selection = false;
        this.canvas.forEachObject(el => {
            el.selectable = false;
            el.hoverCursor = 'default';
        });

        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
    }

    enableSelection() {
        this.canvas.selection = true;
        this.canvas.discardActiveObject();
        this.canvas.forEachObject(el => {
            el.selectable = true;
            el.hoverCursor = 'move';
            el.setCoords();
            el.onclick = () => {
                this.canvas.discardActiveObject();
                this.canvas.setActiveObject(el);
                this.canvas.requestRenderAll();
            }
        });
        this.canvas.setCursor("default");
        this.canvas.renderAll();
        this.canvas.requestRenderAll();
    }
}

export default new Board();

