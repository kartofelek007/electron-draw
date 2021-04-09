import Board from "./board.js";
import Controls from "./control.js";
import globalState from "./global-state.js";
import ToolsFactory from "./tools-factory.js";
import Gui from "./gui.js";
import pubsub from "./pubsub.js";
import components from "./componets.js";
const { dialog } = require('electron').remote;

//config --------------
const { app } = require("electron").remote;
const fileUrl = app.getPath("appData") + "/" + "presentation-draw-settings.json";
const fs = require('fs');

const rawData = fs.readFileSync(fileUrl, err => {});
const config = JSON.parse(rawData);
//const config = require("./config-default.js");

const configParser = require("./check-config.js");
const configTest = configParser(config);

if (configTest.errors.length) {
    const msg = `
        Incorrect config file format.
        Correct below issues in %APPDATA%/presentation-draw-settings.json file:

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

    globalState.setConfig(config);
    components.board = new Board("#main");
    components.controls = new Controls(config);
    components.tools = new ToolsFactory();
    components.gui = new Gui();

    //tool ========================
    globalState.setTool("brush");

    //colors ========================
    globalState.setColor(config.keys.colors[0].color);
    pubsub.emit("tool-color");

    //size ========================
    globalState.setSize(config.size.default);
}

