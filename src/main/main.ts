import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import { app, BrowserWindow, ipcMain } from "electron";

import PocketAuth from "./pocketAuth";

let window: BrowserWindow | null;

function createWindow() {
    window = new BrowserWindow({ width: 800, height: 600 });

    window.loadURL(url.format({
        pathname: path.join(__dirname, "../../static/index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.webContents.openDevTools();

    window.on("closed", () => {
        window = null;
    });
}

app.on("ready", () => {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, "../../node_modules/vue-devtools/vender"));

    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (window === null) {
        createWindow();
    }
});

const authCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../credentials.json"), "utf-8"));

let pocketAuth: PocketAuth;

ipcMain.on("pocket-auth", (event) => {
    pocketAuth = new PocketAuth(authCredentials.pocket.consumer_key);

    pocketAuth.getAccessToken()
        .then((accessToken) => {
            if (window !== null) {
                window.show();
            }
            event.sender.send("pocket-auth-reply", null, accessToken);
        })
        .catch((error: Error) => {
            event.sender.send("pocket-auth-reply", error.message, null);
        });
});
