import globalState from "./global-state.js";
import storage from "./utils/localStorage.js";
import pubsub from "./pubsub.js";
import components from "./componets.js";

export default class Gui {
    constructor() {
        this.elementGui = document.querySelector("#gui");
        this.generateHTML();
        this.elementTools = document.querySelector("#guiToolsPlace");
        this.elementColorList = document.querySelector("#guiColorsListPlace");
        this.elementColorCurrent = document.querySelector("#guiColorsCurrent");

        this.init();

        const guiID = Symbol();

        pubsub.subscribe("gui-toggleHelpKey", guiID, () => this.toggleGuiHelpKeys());
        pubsub.subscribe("tool-type", guiID, () => this.updateInfo());
        pubsub.subscribe("tool-color", guiID, () => this.updateInfo());
        pubsub.subscribe("tool-size", guiID, () => this.updateInfo());
        pubsub.subscribe("gui-hide", guiID, () => this.toggleGui())
    }

    init() {
        if (!globalState.config.interactiveGui) {
            this.elementGui.classList.add("gui-non-interactive");
        }

        if (storage.get("guiHidden")) {
            this.elementGui.classList.add("gui-hidden");
        }

        if (globalState.config.guiTheme === "light") {
            this.elementGui.classList.add("gui--white");
        }

        this.createToolsIcons();
        this.createColorsList();
        this.guiMove();

        this.elementGui.classList.add("gui-ready")
    }

    toggleGuiHelpKeys() {
        this.elementGui.classList.toggle("with-help");
        const keysElements = this.elementGui.querySelectorAll(".gui-tools-key");

        if (this.elementGui.classList.contains("with-help")) {
            [...keysElements].forEach((el, i) => {
                const time = 0.15 * i;
                el.style.transition = `${time}s opacity, ${time}s transform`
            })
        } else {
            [...keysElements].reverse().forEach((el, i) => {
                const time = 0.15 * i;
                el.style.transition = `${time}s opacity, ${time}s transform`
            })
        }
    }

    generateHTML() {
        this.elementGui.innerHTML = `
            <div class="gui-move">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 7H11V11H7zM7 13H11V17H7zM13 7H17V11H13zM13 13H17V17H13z"/></svg>
            </div>
            <div class="gui-section">
                <div class="gui-colors-current color" id="guiColorsCurrent"></div>
                <div class="gui-menu" id="guiColorsListPlace"></div>
            </div>
            <div class="gui-section" id="guiToolsPlace">
            </div>
        `;
    }

    guiMove() {
        let move = {
            isMove : false,
            offsetX : 0,
            offsetY : 0
        };

        if (storage.get("guiPosition")) {
            const pos = JSON.parse(storage.get("guiPosition"));

            //jezeli gui wyszlo poza ekran cofam do domyslnych ustawien
            if (
                pos.posX > window.screen.width - this.elementGui.width ||
                pos.posY > window.screen.height - this.elementGui.width ||
                pos.posX < 0 ||
                pos.posY < 0
            ) {
                pos.posX = 10;
                pos.posY = 10;
            }

            this.elementGui.style.left = pos.posX + "px";
            this.elementGui.style.top  = pos.posY + "px";

            setTimeout(_ => {
                const guiPos = this.elementGui.getBoundingClientRect();
                const menuPos = this.elementColorList.getBoundingClientRect();

                if (guiPos.x + guiPos.width + menuPos.width + 10 > window.innerWidth) {
                    this.elementColorList.classList.add("gui-menu--left");
                } else {
                    this.elementColorList.classList.remove("gui-menu--left");
                }
            }, 0)
        }

        const guiMove = this.elementGui.querySelector('.gui-move');

        guiMove.addEventListener("mousedown", (e) => {
            move.isMove = true;
            move.offsetX = e.offsetX;
            move.offsetY = e.offsetY;
        });

        document.addEventListener("mousemove", (e) => {
            if (move.isMove) {
                let x = e.pageX - move.offsetX;
                let y = e.pageY - move.offsetY;

                if (x < 0) x = 0;
                if (e.pageX - move.offsetX + this.elementGui.offsetWidth > window.innerWidth) {
                    x = window.innerWidth - this.elementGui.offsetWidth;
                }

                if (y < 0) y = 0;
                if (e.pageY - move.offsetY + this.elementGui.offsetHeight > window.innerHeight) {
                    y = window.innerHeight - this.elementGui.offsetHeight;
                }

                this.elementGui.style.left = x + "px";
                this.elementGui.style.top = y + "px";

                const guiPos = this.elementGui.getBoundingClientRect();
                const menuPos = this.elementColorList.getBoundingClientRect();

                if (guiPos.x + guiPos.width + menuPos.width + 10 > window.innerWidth) {
                    this.elementColorList.classList.add("gui-menu--left");
                } else {
                    this.elementColorList.classList.remove("gui-menu--left");
                }

                //this.elementColorList.classList.
            }
        });

        document.addEventListener("mouseup", (e) => {
            move.isMove = false;
            const pos = {
                posX : parseInt(this.elementGui.style.left, 10),
                posY : parseInt(this.elementGui.style.top, 10)
            };
            storage.set("guiPosition", JSON.stringify(pos));
        });
    }

    createToolsIcons() {
        const iconsSvg = {
            "selection": `<svg xmlns="http://www.w3.org/2000/svg" height="511pt" viewBox="-95 0 511 511.6402" width="511pt"><path d="m315.710938 292.25-288.894532-288.792969c-10.582031-8.402343-26.496094-.382812-26.496094 12.183594v394.667969c0 8.832031 7.167969 16 16 16 4.160157 0 8.148438-1.601563 10.433594-3.90625l80.039063-69.738282 65.28125 152.511719c1.109375 2.601563 3.199219 4.652344 5.824219 5.71875 1.28125.488281 2.625.746094 3.96875.746094 1.429687 0 2.859374-.300781 4.203124-.875l68.691407-29.441406c5.417969-2.300781 7.9375-8.574219 5.613281-13.992188l-63.191406-147.691406h107.136718c8.832032 0 16-7.167969 16-16 0-2.582031-.660156-6.464844-4.609374-11.390625zm0 0"/></svg>`,
            "text": `<svg id="Capa_1" enable-background="new 0 0 467.765 467.765" height="512" viewBox="0 0 467.765 467.765" width="512" xmlns="http://www.w3.org/2000/svg"><path d="m175.412 87.706h58.471v29.235h58.471v-87.706h-292.354v87.706h58.471v-29.235h58.471v292.353h-58.471v58.471h175.383v-58.471h-58.442z"/><path d="m233.882 175.412v87.706h58.471v-29.235h29.235v146.176h-29.235v58.471h116.941v-58.471h-29.235v-146.177h29.235v29.235h58.471v-87.706h-233.883z"/></svg>`,
            "brush": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 21.398c5.504.456 3.533-5.392 8.626-5.445l2.206 1.841c.549 6.645-7.579 8.127-10.832 3.604zm16.878-8.538c1.713-2.687 7.016-11.698 7.016-11.698.423-.747-.515-1.528-1.17-.976 0 0-7.887 6.857-10.213 9.03-1.838 1.719-1.846 2.504-2.441 5.336l2.016 1.681c2.67-1.098 3.439-1.248 4.792-3.373z"/></svg>`,
            "line": `<svg xmlns="http://www.w3.org/2000/svg" height="469pt" viewBox="0 -192 469.33333 469" width="469pt"><path d="m437.332031.167969h-405.332031c-17.664062 0-32 14.335937-32 32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0 32-14.335938 32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0"/></svg>`,
            "rectangle": `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 341.333 341.333" style="enable-background:new 0 0 341.333 341.333;" xml:space="preserve"> <path d="M298.667,0h-256C19.093,0,0,19.093,0,42.667v256c0,23.573,19.093,42.667,42.667,42.667h256c23.573,0,42.667-19.093,42.667-42.667v-256C341.333,19.093,322.24,0,298.667,0z M298.667,298.667h-256v-256h256V298.667z"/></svg>`,
            "circle": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M12,20c-4.411,0-8-3.589-8-8s3.589-8,8-8 s8,3.589,8,8S16.411,20,12,20z"/></svg>`,
            "points": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19,2H5C3.897,2,3,2.897,3,4v12c0,1.103,0.897,2,2,2h3.586L12,21.414L15.414,18H19c1.103,0,2-0.897,2-2V4 C21,2.897,20.103,2,19,2z M19,16h-4.414L12,18.586L9.414,16H5V4h14V16z"/><circle cx="15" cy="10" r="2"/><circle cx="9" cy="10" r="2"/></svg>`,
            "arrow": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/></svg>`,
            "ruler": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.875,7H3.125C1.953,7,1,7.897,1,9v6c0,1.103,0.953,2,2.125,2h17.75C22.047,17,23,16.103,23,15V9 C23,7.897,22.047,7,20.875,7z M20.875,15H3.125c-0.057,0-0.096-0.016-0.113-0.016c-0.007,0-0.011,0.002-0.012,0.008L2.988,9.046 C2.995,9.036,3.04,9,3.125,9H5v3h2V9h2v4h2V9h2v3h2V9h2v4h2V9h1.875C20.954,9.001,20.997,9.028,21,9.008l0.012,5.946 C21.005,14.964,20.96,15,20.875,15z"/></svg>`,
            "zoom": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg>`,
            "spot": `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 469.333 469.333" style="enable-background:new 0 0 469.333 469.333;" xml:space="preserve"><path d="M234.667,170.667c-35.307,0-64,28.693-64,64s28.693,64,64,64s64-28.693,64-64S269.973,170.667,234.667,170.667z"/><path d="M234.667,74.667C128,74.667,36.907,141.013,0,234.667c36.907,93.653,128,160,234.667,160c106.773,0,197.76-66.347,234.667-160C432.427,141.013,341.44,74.667,234.667,74.667z M234.667,341.333c-58.88,0-106.667-47.787-106.667-106.667S175.787,128,234.667,128s106.667,47.787,106.667,106.667S293.547,341.333,234.667,341.333z"/></svg>`,
        };

        const ul = document.createElement("ul");
        ul.classList.add("gui-tools");

        for (const el of globalState.config.keys.tools) {
            const li = document.createElement("li");
            li.dataset.tool = el.tool;

            const svgCnt = document.createElement("div");
            svgCnt.classList.add("gui-tools-svg-cnt");
            svgCnt.innerHTML = iconsSvg[el.tool];
            li.append(svgCnt);
            li.addEventListener("click", e => {
                if (globalState.tool !== null) {
                    pubsub.publish("board-clearCanvas2");
                    globalState.tool.destructor();
                }

                components.tools.setTool(li.dataset.tool);
                pubsub.publish("tool-type");
            });

            const key = document.createElement("span");
            key.classList.add("gui-tools-key");
            key.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${el.key}</text>
                </svg>
            `;

            li.append(key);
            ul.append(li);
        }

        this.elementTools.append(ul);
    }

    markCurrentTool() {
        const li = this.elementTools.querySelectorAll("li");
        li.forEach(el => {
            if (el.dataset.tool === globalState.toolName) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        })
    }

    updateInfo() {
        this.markCurrentTool();
        this.markCurrentColor();
    }

    createColorsList() {
        const ul = document.createElement("ul");
        ul.classList.add("gui-colors-list");

        for (const el of globalState.config.keys.colors) {
            const li = document.createElement("li");
            li.classList.add("color");
            li.dataset.color = el.color;
            li.style.background = el.color;
            ul.append(li);
            li.addEventListener("click", function() {
                const li = this.parentElement.children;
                [...li].forEach(el => el.classList.remove("active"));
                this.classList.add("active");
                globalState.color = this.dataset.color;
                pubsub.publish("tool-color");
            });
        }

        this.elementColorList.append(ul);
    }

    markCurrentColor() {
        const li = this.elementColorList.querySelectorAll("li");
        li.forEach(el => {
            if (el.dataset.color === globalState.color) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });
        this.elementColorCurrent.style.background = globalState.color;
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