# Presentation drawing app
App for drawing over desktop made in Electron


### Installation
Install all dependency by **npm install**. Then run **npm start**.
In task bar (window) blue icon will show up. 
Then you may hit F7 to start draw on screen.

### Build exe
Run **npm build**. Build app will appear in dist folder. Only **presentation_drawer.exe** is required.

### Keys
Below you can find list of default keys uses in application. You can change it in <strong>settings.json</strong> file.

#### Global key:
**F7** - hide to tray / show from tray. You can change it in settings.json (toggleKey property)</li>


#### Tools:
**1** - select
**2** - free draw
**3** - rectangle
**4** - line
**5** - arrow
**6** - text
**0** - light screen fragment with circle

In select mode you can group / ungroup objects with **Ctrl + G** and **Ctrl + Shift  + G**

#### Colors:
**r** - red
**g** - green
**b** - blue
**p** - pink
**y** - yellow
**o** - orange


#### Other stuff:
    **[** - decrease brush/line size. You can do this with mouse wheel
    **]** - increase brush/line size. You can do this with mouse wheel
    **c** - clear screen
    **Esc** - clear screen and hide app to tray
    **`** - toggle gui menu
    **/** - toggle white board
    **?** - toggle help numbers
    **Ctrl + q** - quit program