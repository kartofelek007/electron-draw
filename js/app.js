import Board from "./board.js";
import Controls from "./control.js";
import globalState from "./global-state.js";
import ToolsFactory from "./tools-factory.js";
import Gui from "./gui.js";
import pubsub from "./pubsub.js";
import gui from "./gui.js";
import config from "../config.js";

globalState.config = config;
gui.init();

globalState.tool = "brush";
globalState.color = globalState.config.keys.colors[0].color;
globalState.size = globalState.config.size.default;
