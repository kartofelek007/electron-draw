export default {
    color: "red",
    size: 10,
    sizeText : 10,
    toolName : null,
    tool : null,
    canChangeColor : true,
    canChangeSize : true,
    canChangeTool : true,

    mouse: {
        x: 0,
        y: 0,
        startX : 0,
        startY : 0,
        mouseDown : false
    },

    decreaseWidth() {
        if (this.toolName === "text") {
            this.sizeText -= this.config.size.step;
            if (this.sizeText < this.config.size.min) {
                this.sizeText = this.config.size.min;
            }
        } else {
            this.size -= this.config.size.step;
            if (this.size < this.config.size.min) {
                this.size = this.config.size.min;
            }
        }
    },

    increaseWidth() {
        if (this.toolName === "text") {
            this.sizeText += this.config.size.step;
                if (this.sizeText > this.config.size.max) {
                this.sizeText = this.config.size.max;
            }
        } else {
            this.size += this.config.size.step;
            if (this.size > this.config.size.max) {
                this.size = this.config.size.max;
            }
        }
    },

    config : {}
}