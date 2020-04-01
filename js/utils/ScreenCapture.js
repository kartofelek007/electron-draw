const electron = require('electron');
const {desktopCapturer} = require('electron');

const remote = electron.remote;
const size = remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds();

const primaryDisplay = remote.screen.getPrimaryDisplay();

export class ScreenCapture {
    constructor() {
        this.width = size.width;
        this.height = size.height;
        this.zoom = 3;
    }

    handleStream(stream) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.style.cssText = 'position:absolute; top:-10000px; left:-10000px;';
            document.body.appendChild(video);

            video.addEventListener("loadedmetadata", () => {
                video.style.height = this.height + 'px';
                video.style.width = this.width + 'px';
                video.play();

                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, this.width, this.height);
                resolve(canvas);
                video.remove();

                try {
                    // Destroy connect to stream
                    stream.getTracks()[0].stop();
                } catch (e) {
                    reject(e)
                }
            });

            video.srcObject = stream;
        })
    }

    capture() {
        return new Promise((resolve, reject) => {
            desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
                for (const source of sources) {
                    if (source.display_id == primaryDisplay.id) {
                    //if (source.name === "Entire Screen" || source.name === "Screen 1" || source.name === "Screen 2") {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({
                                audio: false,
                                video: {
                                    mandatory: {
                                        chromeMediaSource: 'desktop',
                                        chromeMediaSourceId: source.id,
                                        minWidth: this.width,
                                        maxWidth: this.width,
                                        minHeight: this.height,
                                        maxHeight: this.height
                                    }
                                }
                            });

                            const canvas = await this.handleStream(stream);
                            resolve(canvas);
                        } catch (e) {
                            reject(e);
                        }
                    }
                }
            });
        })
    }
}