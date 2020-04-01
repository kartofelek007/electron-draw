import board from "../board.js";
import globalState from "../global-state.js";
import {hexToRGBA} from "../utils/colors.js";
import config from "../config.js";


export class Selection {
    constructor() {
        this.idSubscribe = Symbol();
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this._clipboard = null;

        this.bindEvents();

        board.enableSelection();
        board.cursorDefault();

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

        globalState.colorSubscribers.subscribe(this.idSubscribe, () => {
            if (board.canvas.getActiveObject()) {
                loopThroughElements(board.canvas.getActiveObjects(), {
                    "i-text" : function(el) {
                        el.set("fill", globalState.color);
                    },
                    "rect" : function(el) {
                        if (el.fill !== "transparent") {
                            if (hexToRGBA(globalState.color, 0.7)) {
                                el.set("fill", hexToRGBA(globalState.color, 0.7));
                            }
                        }
                        el.set("stroke", globalState.color);
                    },
                    [otherTypeKey] : function(el) {
                        el.set("stroke", globalState.color);
                    }
                });
                board.canvas.renderAll();
            }
        });

        globalState.sizeSubscribers.subscribe(this.idSubscribe, (e) => {
            console.log(e);
            if (board.canvas.getActiveObject()) {
                board.canvas.getActiveObjects().forEach(el => {
                    const type = el.get("type");
                    if (type === "i-text") {
                        let size = el.get('fontSize');
                        size += (e.deltaY < 0)? -config.size.step : config.size.step;
                        size = Math.min(size, config.size.max + 10);
                        size = Math.max(size, config.size.min + 10);
                        el.set('fontSize', size);
                    } else if (type === "group") {
                    } else {
                        let size = el.get('strokeWidth');
                        size += (e.deltaY < 0)? -config.size.step : config.size.step;
                        size = Math.min(size, config.size.max);
                        size = Math.max(size, config.size.min);
                        el.set("strokeWidth", size);
                    }
                });

                const selection = board.canvas.getActiveObject();

                if (selection.type === 'activeSelection') {
                    selection.addWithUpdate()
                }
                board.canvas.requestRenderAll();
            }
        })
    }

    destructor() {
        this._clipboard = null;

        board.disableSelection();
        board.cursorHidden();

        this.unbindEvents();

        if (globalState.colorSubscribers[this.idSubscribe]) delete globalState.colorSubscribers[this.idSubscribe];
        if (globalState.toolSubscribers[this.idSubscribe]) delete globalState.toolSubscribers[this.idSubscribe];
        if (globalState.sizeSubscribers[this.idSubscribe]) delete globalState.sizeSubscribers[this.idSubscribe];
    }

    bindEvents() {
        //board.canvas.on("object:selected", function(o) {
        //    o.target.bringToFront();
        //});
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

    unbindEvents() {
        //board.canvas.off("object:selected", function(o) {
        //    o.target.bringToFront();
        //});
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
            if (board.canvas.getActiveObject()) {
                board.canvas.getActiveObject().clone(cloned => {
                    this._clipboard = cloned;
                });
            }
        }

        if (e.key.toLowerCase() === "v" && e.ctrlKey) {
            if (this._clipboard)
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