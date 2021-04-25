import Board from "./board.js";
import Controls from "./control.js";
import globalState from "./global-state.js";
import ToolsFactory from "./tools-factory.js";
import Gui from "./gui.js";
import pubsub from "./pubsub.js";
import gui from "./gui.js";
import config from "../config.js";

globalState.setConfig(config);
gui.init();

globalState.setTool("brush");
globalState.setColor(globalState.getConfig().keys.colors[0].color);
globalState.setSize(globalState.getConfig().size.default);
