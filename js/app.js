import Board from "./board.js";
import Controls from "./control.js";
import globalState from "./global-state.js";
import ToolsFactory from "./tools-factory.js";
import Gui from "./gui.js";
import pubsub from "./pubsub.js";
import gui from "./gui.js";
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
        title: "Incorrect config file data",
        message: msg
    });

    app.quit();
}

globalState.setConfig(config);
gui.init();

globalState.setTool("brush");
globalState.setColor(globalState.getConfig().keys.colors[0].color);
globalState.setSize(globalState.getConfig().size.default);

