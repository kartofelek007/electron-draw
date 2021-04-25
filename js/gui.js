import globalState from "./global-state.js";
import storage from "./utils/localStorage.js";
import pubsub from "./pubsub.js";

class Gui {
    constructor() {
        this.elementGui = document.querySelector("#gui");
        this.generateHTML();
        this.elementTools = document.querySelector("#guiToolsPlace");
        this.elementCurrentColor = document.querySelector("#guiCurrentColor");

        this.updateInfo = this.updateInfo.bind(this);
        this.toggleGui = this.toggleGui.bind(this);
        this.updateGuiTheme = this.updateGuiTheme.bind(this);
    }

    init() {
        pubsub.on("tool-type", this.updateInfo);
        pubsub.on("tool-color", this.updateInfo);
        pubsub.on("tool-size", this.updateInfo);
        pubsub.on("gui-hide", this.toggleGui)
        pubsub.on("white-board", this.updateGuiTheme)

        if (storage.get("guiHidden")) {
            this.elementGui.classList.add("gui-hidden");
        }

        this.createToolsIcons();
        this.elementGui.classList.add("gui-ready")
    }

    updateGuiTheme(whiteBoardShow) {
        if (whiteBoardShow) {
            this.elementGui.classList.add("dark");
        } else {
            this.elementGui.classList.remove("dark");
        }
    }

    generateHTML() {
        this.elementGui.innerHTML = `            
            <div class="gui-el gui-el-with-color">
                <div class="gui-el__color" id="guiCurrentColor"></div>
                <div class="gui-el__bg"></div>
            </div>          
            <div class="gui-tools" id="guiToolsPlace"></div>  
        `;
    }

    createToolsIcons() {
        const iconsSvg = {
            "selection": `<svg xmlns="http://www.w3.org/2000/svg" height="511pt" viewBox="-95 0 511 511.6402" width="511pt"><path d="m315.710938 292.25-288.894532-288.792969c-10.582031-8.402343-26.496094-.382812-26.496094 12.183594v394.667969c0 8.832031 7.167969 16 16 16 4.160157 0 8.148438-1.601563 10.433594-3.90625l80.039063-69.738282 65.28125 152.511719c1.109375 2.601563 3.199219 4.652344 5.824219 5.71875 1.28125.488281 2.625.746094 3.96875.746094 1.429687 0 2.859374-.300781 4.203124-.875l68.691407-29.441406c5.417969-2.300781 7.9375-8.574219 5.613281-13.992188l-63.191406-147.691406h107.136718c8.832032 0 16-7.167969 16-16 0-2.582031-.660156-6.464844-4.609374-11.390625zm0 0"/></svg>`,
            "text": `<svg enable-background="new 0 0 467.765 467.765" height="512" viewBox="0 0 467.765 467.765" width="512" xmlns="http://www.w3.org/2000/svg"><path d="m175.412 87.706h58.471v29.235h58.471v-87.706h-292.354v87.706h58.471v-29.235h58.471v292.353h-58.471v58.471h175.383v-58.471h-58.442z"/><path d="m233.882 175.412v87.706h58.471v-29.235h29.235v146.176h-29.235v58.471h116.941v-58.471h-29.235v-146.177h29.235v29.235h58.471v-87.706h-233.883z"/></svg>`,
            "brush": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 21.398c5.504.456 3.533-5.392 8.626-5.445l2.206 1.841c.549 6.645-7.579 8.127-10.832 3.604zm16.878-8.538c1.713-2.687 7.016-11.698 7.016-11.698.423-.747-.515-1.528-1.17-.976 0 0-7.887 6.857-10.213 9.03-1.838 1.719-1.846 2.504-2.441 5.336l2.016 1.681c2.67-1.098 3.439-1.248 4.792-3.373z"/></svg>`,
            "line": `<svg xmlns="http://www.w3.org/2000/svg" height="469pt" viewBox="0 -192 469.33333 469" width="469pt"><path d="m437.332031.167969h-405.332031c-17.664062 0-32 14.335937-32 32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0 32-14.335938 32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0"/></svg>`,
            "rectangle": `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 341.333 341.333" style="enable-background:new 0 0 341.333 341.333;" xml:space="preserve"> <path d="M298.667,0h-256C19.093,0,0,19.093,0,42.667v256c0,23.573,19.093,42.667,42.667,42.667h256c23.573,0,42.667-19.093,42.667-42.667v-256C341.333,19.093,322.24,0,298.667,0z M298.667,298.667h-256v-256h256V298.667z"/></svg>`,
            "circle": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M12,20c-4.411,0-8-3.589-8-8s3.589-8,8-8 s8,3.589,8,8S16.411,20,12,20z"/></svg>`,
            "arrow": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/></svg>`
        };

        for (const el of globalState.getConfig().keys.tools) {
            const div = document.createElement("div");
            div.classList.add("gui-el")
            div.dataset.tool = el.tool;

            div.innerHTML = `
                <div class="gui-el__icon">
                    ${iconsSvg[el.name]}
                </div>
                <div class="gui-el__key">${el.key}</div>
                <div class="gui-el__bg"></div>
            `
            div.addEventListener("click", e => {
                if (globalState.getTool() !== null) {
                    pubsub.emit("board-clearCanvas2");
                    globalState.getTool().destructor();
                }

                globalState.setTool(div.dataset.tool);
                pubsub.emit("tool-type");
            });

            this.elementTools.append(div);
        }
    }

    markCurrentTool() {
        const icons = this.elementTools.querySelectorAll(".gui-el");
        icons.forEach(el => {
            if (el.dataset.tool === globalState.getTool().name) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        })
    }

    markCurrentColor() {
        this.elementCurrentColor.style.backgroundColor = globalState.getColor();
    }

    updateInfo() {
        this.markCurrentTool();
        this.markCurrentColor();
    }

    toggleGui() {
        const keyInStorage = "guiHidden";

        this.elementGui.classList.toggle("gui-hidden");
        if (this.elementGui.classList.contains("gui-hidden")) {
            storage.set(keyInStorage);
        } else {
            storage.remove(keyInStorage);
        }
    }
}

export default new Gui();