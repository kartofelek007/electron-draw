const fs = require('fs');
const defaultConfig = require("./config-default.js");
const { app } = require("electron");

const fileUrl = app.getPath("appData") + "/" + "presentation-draw-settings.json";
let config = {...defaultConfig};

try {
    const rawData = fs.readFileSync(fileUrl, err => {});
    config = JSON.parse(rawData);
} catch(err) {
    fs.writeFile(fileUrl, JSON.stringify(config, null, 1), err => {
        dialog.showMessageBoxSync({
            type : "error",
            title : "Cant't create file with config in %APPDATA% folder",
            message : configTest.errors
        });
        throw new Error("Cant't create file with config in %APPDATA% folder");
    });
}

module.exports = config;