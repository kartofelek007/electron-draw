import globalState from "../global-state.js";
import {hexToRGBA} from "../utils/colors.js";
import pubsub from "../pubsub.js";
import board from "../board.js";
import Tool from "./tool.js";

export class Selection extends Tool {
    constructor() {
        super();

        this.name = "selection";
        this._clipboard = null;

        board.enableSelection();
        board.cursorDefault();

        this.onKeyUp = this.onKeyUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.changeToolSize = this.changeToolSize.bind(this);
        this.changeToolColor = this.changeToolColor.bind(this);

        pubsub.on("tool-size", this.changeToolSize);
        pubsub.on("tool-color", this.changeToolColor);


    }

    changeToolSize() {
        if (board.canvas.getActiveObject()) {
            board.canvas.getActiveObjects().forEach(el => {
                const type = el.get("type");
                if (type === "i-text") {
                    let size = el.get('fontSize');
                    size += (e.deltaY > 0) ? -globalState.getConfig().size.step : globalState.getConfig().size.step;
                    size = Math.min(size, globalState.getConfig().size.max + 10);
                    size = Math.max(size, globalState.getConfig().size.min + 10);
                    el.set('fontSize', size);
                } else if (type === "group") {
                } else {
                    let size = el.get('strokeWidth');
                    size += (e.deltaY > 0) ? -globalState.getConfig().size.step : globalState.getConfig().size.step;
                    size = Math.min(size, globalState.getConfig().size.max);
                    size = Math.max(size, globalState.getConfig().size.min);
                    el.set("strokeWidth", size);
                }
            });

            const selection = board.canvas.getActiveObject();

            if (selection.type === 'activeSelection') {
                selection.addWithUpdate()
            }
            board.canvas.requestRenderAll();
        }
    }

    changeToolColor() {
        const otherTypeKey = Symbol();

        const loopThroughElements = function(elements, cb) {
            elements.forEach(el => {
                const type = el.get("type");

                if (type === "group") {
                    loopThroughElements(el._objects, cb)
                } else if (cb[type]) {
                    cb[type](el);
                } else {
                    cb[otherTypeKey](el);
                }
            });
        };

        if (board.canvas.getActiveObject()) {
            loopThroughElements(board.canvas.getActiveObjects(), {
                "i-text": function(el) {
                    el.set("fill", globalState.getColor());
                },
                "rect": function(el) {
                    if (el.fill !== "transparent") {
                        if (hexToRGBA(globalState.getColor(), 0.7)) {
                            el.set("fill", hexToRGBA(globalState.getColor(), 0.7));
                        }
                    }
                    el.set("stroke", globalState.getColor());
                },
                [otherTypeKey]: function(el) {
                    el.set("stroke", globalState.getColor());
                }
            });
            board.canvas.renderAll();
        }
    }

    destructor() {
        super.destructor();

        this._clipboard = null;

        board.disableSelection();
        board.cursorHidden();

        pubsub.off("tool-size", this.changeToolSize);
        pubsub.off("tool-color", this.changeToolColor);
    }

    bindEvents() {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

    unbindEvents() {
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
    }

    onKeyUp(e) {
        if (e.key.toLowerCase() === "delete") {
            if (board.canvas.getActiveObject()) {
                board.canvas.getActiveObjects().forEach(el => {
                    board.canvas.remove(el);
                    el.strokeWidth = globalState.size
                });
                board.canvas.discardActiveObject().renderAll()
            }
        }

        if (e.key === "[" && globalState.canChangeColor && globalState.canChangeSize && globalState.canChangeTool) {
            board.canvas.getActiveObject().sendBackwards();
        }
        if (e.key === "]" && globalState.canChangeColor && globalState.canChangeSize && globalState.canChangeTool) {
            board.canvas.getActiveObject().bringForward();
        }

        if (e.key.toLowerCase() === "escape") {
            console.log('escape');
            board.canvas.discardActiveObject();
            board.canvas.requestRenderAll();
        }

        if (e.key.toLowerCase() === "a" && e.ctrlKey) {
            board.canvas.discardActiveObject();
            const sel = new fabric.ActiveSelection(board.canvas.getObjects(), {
                canvas: board.canvas
            });
            board.canvas.setActiveObject(sel);
            board.canvas.requestRenderAll();
            //board.canvas.
        }

        if (e.key.toLowerCase() === "c" && e.ctrlKey) {
            console.log('test');
            if (board.canvas.getActiveObject()) {
                board.canvas.getActiveObject().clone(cloned => {
                    this._clipboard = cloned;
                });
            }
        }

        if (e.key.toLowerCase() === "v" && e.ctrlKey) {
            if (this._clipboard) {
                console.log('test2');
                this._clipboard.clone(clonedObj => {
                    board.canvas.discardActiveObject();
                    clonedObj.set({
                        left: clonedObj.left + 20,
                        top: clonedObj.top + 20,
                        evented: true
                    });

                    if (clonedObj.type === 'activeSelection') {
                        // active selection needs a reference to the canvas.
                        clonedObj.canvas = board.canvas;
                        clonedObj.forEachObject(obj => {
                            board.canvas.add(obj);
                        });
                        // this should solve the unselectability
                        clonedObj.setCoords();
                    } else {
                        board.canvas.add(clonedObj);
                    }
                    this._clipboard.top += 20;
                    this._clipboard.left += 20;
                    board.canvas.setActiveObject(clonedObj);
                    board.canvas.requestRenderAll();
                });
            }
        }


    }

    onKeyDown(e) {
        if (e.key.toLowerCase() === "g" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            if (!board.canvas.getActiveObject()) {
                return;
            }
            if (board.canvas.getActiveObject().type !== 'activeSelection') {
                return;
            }
            board.canvas.getActiveObject().toGroup();
            board.canvas.requestRenderAll();
        }

        if (e.key.toLowerCase() === "g" && e.shiftKey && e.ctrlKey) {
            e.preventDefault();

            if (!board.canvas.getActiveObject()) {
                return;
            }
            if (board.canvas.getActiveObject().type !== 'group') {
                return;
            }
            board.canvas.getActiveObject().toActiveSelection();
            board.canvas.requestRenderAll();

        }
    }
}