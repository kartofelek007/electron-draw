const fs = require('fs');
const Validator = require('jsonschema').Validator;
const v = new Validator();

module.exports = function testSchema(configData) {
    const schema = {
        "id": "/Schema",
        "type": "object",
        "properties": {

            "toggleKey": {
                "type": "string",
                "required": true
            },

            "size": {
                "type": "object",
                "required": true,

                "properties": {
                    "min": {
                        "type": "number",
                        "required": true,
                        "minimum": 1,
                        "maximum": 20
                    },
                    "max": {
                        "type": "number",
                        "required": true,
                        "minimum": 1,
                        "maximum": 100
                    },
                    "step": {
                        "type": "number",
                        "required": true,
                        "minimum": 1,
                        "maximum": 20
                    },
                    "default": {
                        "type": "number",
                        "required": true,
                        "minimum": 1,
                        "maximum": 100
                    }
                }
            },

            "interactiveGui": {
                "type": "boolean",
                "required": true
            },

            "askToSaveScreenShoot": {
                "type": "boolean",
                "required": true
            },

            "guiTheme": {
                "type": "string",
                "required": true,
                "enum": ["light", "dark"]
            },

            "keys": {
                "type": "object",
                "required": true,

                "properties": {
                    "hideGui": {
                        "type": "string",
                        "required": true
                    },
                    "clearScreen": {
                        "type": "string",
                        "required": true
                    },
                    "whiteBoard": {
                        "type": "string",
                        "required": true
                    },

                    "colors": {"$ref": "/ColorsSchema"},
                    "tools": {"$ref": "/ToolsSchema"}
                }
            }
        }
    };

    const colorsSchema = {
        "required": true,
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string",
                    "format": "color"
                }
            }
        }
    };

    const toolsSchema = {
        "required": true,
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string"
                },
                "name": {
                    "type": "string",
                    "enum": ["selection", "brush", "rectangle", "line", "arrow", "text", "spot"]
                },
                "tool": {
                    "type": "string",
                    "enum": ["selection", "brush", "rectangle", "line", "arrow", "text", "spot"]
                }
            }
        }
    };

    v.addSchema(colorsSchema, '/ColorsSchema');
    v.addSchema(toolsSchema, '/ToolsSchema');

    return v.validate(configData, schema);
}