import Board from "./board.js";
import Controls from "./control.js";
import globalState from "./global-state.js";
import ToolsFactory from "./tools-factory.js";
import Gui from "./gui.js";
import pubsub from "./pubsub.js";
import components from "./componets.js";
const { dialog } = require('electron').remote;

//config --------------
const fs = require('fs');
const defaultConfig = require("./config-default.js");
let config = {...defaultConfig};

const { app } = require("electron").remote;
const fileUrl = app.getPath("appData") + "/" + "presentation-draw-settings.json";

try {
    const rawData = fs.readFileSync(fileUrl, err => {});
    config = JSON.parse(rawData);
} catch(err) {
}

const configParser = require("./check-config.js");
const configTest = configParser(config);

if (configTest.errors.length) {
    const msg = `
        Incorrect format of config file.
        Correct below in %APPDATA%/presentation-draw-settings.json file:

        ${configTest.errors.map(el => {
            return el.property.replace("instance.", "") + " " + el.message
        }).join("\n")}
    `;
    dialog.showMessageBoxSync({
        type: "error",
        title: "Incorrect config data",
        message: msg
    });
    app.quit();
} else {

    globalState.config = config;
    components.board = new Board("#main");
    components.controls = new Controls(config);
    components.tools = new ToolsFactory();
    components.gui = new Gui();

    //tool ========================
    globalState.toolName = "brush";
    globalState.tool = components["tools"].generateTool("brush", components["board"]);
    pubsub.publish("tool-type");

    //colors ========================
    globalState.color = config.keys.colors[0].color;
    pubsub.publish("tool-color");

    //size ========================
    globalState.size = config.size.default;
    pubsub.publish("tool-size");


}

