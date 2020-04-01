const fs = require('fs');
const dialog = require('electron').remote.dialog;
import config from "../config.js";
import {ScreenCapture} from "./ScreenCapture.js";
const sc = new ScreenCapture();
const { ipcRenderer } = require('electron');

function createSaveText(text) {
    const div = document.createElement("div");
    div.innerText = text;
    div.classList.add("screenshoot-save-completed");
    document.body.append(div);
    setTimeout(() => {
        div.remove();
    }, 1000);
}

function generateFileName(path) {
    let count = 0;
    let lng = Math.max(count.toString.length, 6);
    let countText = count.toString().padStart(lng, "0");
    let fileName = `file-${countText}.jpg`;

    while (fs.existsSync(path + '/' + fileName)) {
        count++;
        lng = Math.max(count.toString.length, 6);
        countText = count.toString().padStart(lng, "0");
        fileName = `file-${countText}.jpg`;
    }

    return `${path}/${fileName}`;
}

async function captureAndSave(filePath) {
    document.body.classList.add("hideForCapture");

    sc.capture().then(canvas => {
        document.body.classList.remove("hideForCapture");

        const url = canvas.toDataURL('image/jpg', 1);
        const base64Data = url.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(filePath, base64Data, 'base64', err => {
            if (err) {
                createSaveText(`Can't create file: ${filePath}`);
            } else {
                createSaveText(`Screenshoot saved to: ${filePath}`);
            }
        });
    });
}

export async function savePrintScreen() {
    let path = "";

    const app = require('electron').remote.app;
    const pathApp = app.getAppPath();

    if (config.askToSaveScreenShoot) {
        path = ipcRenderer.sendSync("getFolderToSave", "");
    } else {
        path = pathApp + "/screenshoots";

        if (!fs.existsSync(pathApp + "/screenshoots")) {
            if (fs.mkdirSync(pathApp + "/screenshoots")) {
                path = pathApp + "/screenshoots";
            } else {
                path = ipcRenderer.sendSync("getFolderToSave", "");
            }
        }
    }
    
    //capture ans save
    const filePath = generateFileName(path);
    console.log(filePath);
    await captureAndSave(filePath);
}