import { Selection } from './tools/selection.js';
import { Brush } from './tools/brush.js';
import { Rectangle } from "./tools/rectangle.js"
import { Line } from "./tools/line.js"
import { Arrow } from "./tools/arrow.js"
import { Text } from "./tools/text.js"

class FactoryTool {
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
        }
    }
}

export default new FactoryTool();