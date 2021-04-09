import { Selection } from './tools/selection.js';
import { Brush } from './tools/brush.js';
import { Rectangle } from "./tools/rectangle.js"
import { Line } from "./tools/line.js"
import { Arrow } from "./tools/arrow.js"
import { Text } from "./tools/text.js"
import { SpotLight } from "./tools/spot-light.js"
import globalState from "./global-state.js";
import pubsub from "./pubsub.js";

export default class FactoryTool {
    constructor() {
        this.tool = null;
    }

    generateTool(name) {
        switch (name) {
            case 'selection':
                return new Selection();
            case 'brush':
                return new Brush();
            case 'rectangle':
                return new Rectangle();
            case 'line':
                return new Line();
            case 'arrow':
                return new Arrow();
            case 'text':
                return new Text();
            case 'spot':
                return new SpotLight();
        }
    }
}
