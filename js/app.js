import board from "./board.js";
import controls from "./control.js";
import globalState from "./global-state.js";
import tools from "./tools.js";
import gui from "./gui.js";
import config from "./config.js";

globalState.toolName = "brush";
globalState.tool = tools.generateTool(globalState.toolName);


//tool ========================
globalState.toolSubscribers.subscribe(Symbol(), () => {
    gui.updateInfo();
    board.updateCanvas2();
});
globalState.toolSubscribers.emit();

//colors ========================
globalState.colorSubscribers.subscribe(Symbol(), () => {
    gui.updateInfo();
    board.updateCanvas2();
});
globalState.color = config.keys.colors[0].color;
globalState.colorSubscribers.emit();

//size ========================
globalState.sizeSubscribers.subscribe(Symbol(), () => {
    board.updateCanvas2();
});
globalState.sizeSubscribers.emit();