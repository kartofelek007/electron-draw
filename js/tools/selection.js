import globalState from "../global-state.js";
import {hexToRGBA} from "../utils/colors.js";
import pubsub from "../pubsub.js";
import components from "../componets.js";

export class Selection {
    constructor() {
        this.name = "selection";

        this.idSubscribe = Symbol();
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this._clipboard = null;

        this.bindEvents();

        components.board.enableSelection();
        components.board.cursorDefault();

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

        pubsub.on("tool-color", this.idSubscribe, () => {
            if (components.board.canvas.getActiveObject()) {
                loopThroughElements(components.board.canvas.getActiveObjects(), {
                    "i-text" : function(el) {
                        el.set("fill", globalState.getColor());
                    },
                    "rect" : function(el) {
                        if (el.fill !== "transparent") {
                            if (hexToRGBA(globalState.getColor(), 0.7)) {
                                el.set("fill", hexToRGBA(globalState.getColor(), 0.7));
                            }
                        }
                        el.set("stroke", globalState.getColor());
                    },
                    [otherTypeKey] : function(el) {
                        el.set("stroke", globalState.getColor());
                    }
                });
                components.board.canvas.renderAll();
            }
        });

        pubsub.on("tool-size", this.idSubscribe, (e) => {
            if (components.board.canvas.getActiveObject()) {
                components.board.canvas.getActiveObjects().forEach(el => {
                    const type = el.get("type");
                    if (type === "i-text") {
                        let size = el.get('fontSize');
                        size += (e.deltaY > 0)? -globalState.config.size.step : globalState.config.size.step;
                        size = Math.min(size, globalState.config.size.max + 10);
                        size = Math.max(size, globalState.config.size.min + 10);
                        el.set('fontSize', size);
                    } else if (type === "group") {
                    } else {
                        let size = el.get('strokeWidth');
                        size += (e.deltaY > 0)? -globalState.config.size.step : globalState.config.size.step;
                        size = Math.min(size, globalState.config.size.max);
                        size = Math.max(size, globalState.config.size.min);
                        el.set("strokeWidth", size);
                    }
                });

                const selection = components.board.canvas.getActiveObject();

                if (selection.type === 'activeSelection') {
                    selection.addWithUpdate()
                }
                components.board.canvas.requestRenderAll();
            }
        })
    }

    destructor() {
        this._clipboard = null;

        components.board.disableSelection();
        components.board.cursorHidden();

        this.unbindEvents();

        pubsub.off("tool-color", this.idSubscribe);
        pubsub.off("tool-size", this.idSubscribe);
        pubsub.off("tool-tool", this.idSubscribe);
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
            if (components.board.canvas.getActiveObject()) {
                components.board.canvas.getActiveObjects().forEach(el => {
                    components.board.canvas.remove(el);
                    el.strokeWidth = globalState.size
                });
                components.board.canvas.discardActiveObject().renderAll()
            }
        }

        if (e.key === "[" && globalState.canChangeColor && globalState.canChangeSize && globalState.canChangeTool) {
            components.board.canvas.getActiveObject().sendBackwards();
        }
        if (e.key === "]" && globalState.canChangeColor && globalState.canChangeSize && globalState.canChangeTool) {
            components.board.canvas.getActiveObject().bringForward();
        }

        if (e.key.toLowerCase() === "escape") {
            console.log('escape');
            components.board.canvas.discardActiveObject();
            components.board.canvas.requestRenderAll();
        }

        if (e.key.toLowerCase() === "a" && e.ctrlKey) {
            components.board.canvas.discardActiveObject();
            const sel = new fabric.ActiveSelection(components.board.canvas.getObjects(), {
              canvas: components.board.canvas
            });
            components.board.canvas.setActiveObject(sel);
            components.board.canvas.requestRenderAll();
            //components.board.canvas.
        }

        if (e.key.toLowerCase() === "c" && e.ctrlKey) {
            console.log('test');
            if (components.board.canvas.getActiveObject()) {
                components.board.canvas.getActiveObject().clone(cloned => {
                    this._clipboard = cloned;
                });
            }
        }

        if (e.key.toLowerCase() === "v" && e.ctrlKey) {
            if (this._clipboard) {
                console.log('test2');
                this._clipboard.clone(clonedObj => {
                    components.board.canvas.discardActiveObject();
                    clonedObj.set({
                        left: clonedObj.left + 20,
                        top: clonedObj.top + 20,
                        evented: true
                    });

                    if (clonedObj.type === 'activeSelection') {
                        // active selection needs a reference to the canvas.
                        clonedObj.canvas = components.board.canvas;
                        clonedObj.forEachObject(obj => {
                            components.board.canvas.add(obj);
                        });
                        // this should solve the unselectability
                        clonedObj.setCoords();
                    } else {
                        components.board.canvas.add(clonedObj);
                    }
                    this._clipboard.top += 20;
                    this._clipboard.left += 20;
                    components.board.canvas.setActiveObject(clonedObj);
                    components.board.canvas.requestRenderAll();
                });
            }
        }


    }

    onKeyDown(e) {
        if (e.key.toLowerCase() === "g" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            if (!components.board.canvas.getActiveObject()) {
                return;
            }
            if (components.board.canvas.getActiveObject().type !== 'activeSelection') {
                return;
            }
            components.board.canvas.getActiveObject().toGroup();
            components.board.canvas.requestRenderAll();
        }

        if (e.key.toLowerCase() === "g" && e.shiftKey && e.ctrlKey) {
            e.preventDefault();

            if (!components.board.canvas.getActiveObject()) {
                return;
            }
            if (components.board.canvas.getActiveObject().type !== 'group') {
                return;
            }
            components.board.canvas.getActiveObject().toActiveSelection();
            components.board.canvas.requestRenderAll();

        }
    }
}