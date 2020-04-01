const fs = require('fs');
const path = require("path");

export default {
    "toggleKey" : "F7",

    "size": {
        "min": 4,
        "max": 30,
        "step": 2,
        "default": 10
    },

    "interactiveGui" : true,

    "askToSaveScreenShoot" : true,

    "guiTheme" : "light", //"dark", "light"

    "keys" : {
        "hideGui" : "`",
        "clearScreen": "c",
        "whiteBoard": "/",
        "saveKey" : ".",

        "colors": [
            {"key" : "r", "name": "red", "color" : "#FA122E"},
            {"key" : "g", "name": "green", "color" : "#2CD864"},
            {"key" : "b", "name": "blue", "color" : "#0080FF"},
            {"key" : "o", "name": "orange", "color" : "#FF9B00"},
            {"key" : "y", "name": "yellow", "color" : "#E3E36A"},
            {"key" : "v", "name": "violet", "color" : "#7200DA"},
            {"key" : "d", "name": "dark", "color" : "#311e3e"},
            {"key" : "w", "name": "white", "color" : "#fffcf0"},

        ],

        "tools" : [
            {"key": "1", "name": "selection", "tool": "selection"},
            {"key": "2", "name": "brush", "tool": "brush"},
            {"key": "3", "name": "rectangle", "tool": "rectangle"},
            {"key": "4", "name": "line", "tool": "line"},
            {"key": "5", "name": "arrow", "tool": "arrow"},
            {"key": "6", "name": "text", "tool": "text"},
            {"key": "0", "name": "spot", "tool": "spot"}
        ]
    }
}

let config = {};

try {
    const rawData = fs.readFileSync("./settings.json");
    config = JSON.parse(rawData);
} catch(err) {
    config = {...defaultConfig};
}

export default config;