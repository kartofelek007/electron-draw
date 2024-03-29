export default {
    "size": {
        "min": 4,
        "max": 30,
        "step": 2,
        "default": 4
    },

    "askToSaveScreenShoot" : true,

    "keys" : {
        "hideGui" : "`",
        "clearScreen": "c",

        "colors": [
            {"key" : "r", "name": "red", "color" : "#FA122E"},
            {"key" : "g", "name": "green", "color" : "#2CD864"},
            {"key" : "b", "name": "blue", "color" : "#0080FF"},
            {"key" : "o", "name": "orange", "color" : "#FF9B00"},
            {"key" : "y", "name": "yellow", "color" : "#eec51f"},
            {"key" : "v", "name": "violet", "color" : "#8d25ec"},
            {"key" : "p", "name": "violet", "color" : "#ff00f3"},
        ],

        "tools" : [
            {"key": "1", "name": "selection", "tool": "selection"},
            {"key": "2", "name": "brush", "tool": "brush"},
            {"key": "3", "name": "rectangle", "tool": "rectangle"},
            {"key": "4", "name": "line", "tool": "line"},
            {"key": "5", "name": "text", "tool": "text"}
        ]
    }
};