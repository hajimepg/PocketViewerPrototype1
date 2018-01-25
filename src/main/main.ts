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

ipcMain.on("sync-initial-state", (event) => {
    /* tslint:disable:object-literal-sort-keys */
    event.returnValue = {
        // 開発テンポを良くするため、一時的にダミーを設定
        // TODO: アクセストークンを使用する段階になったら空文字に戻すこと
        accessToken: "dummyToken",
        authErrorMessage: "",
        views: {
            unread: {
                count: 456,
            },
            hosts: [
                {
                    name: "twitter.com",
                    count: 10,
                },
                {
                    name: "pixiv.net",
                    count: 20,
                },
                {
                    name: "Other",
                    count: 30,
                },
            ],
            tags: [
                {
                    name: "Programming",
                    count: 40,
                },
                {
                    name: "Game",
                    count: 40,
                },
            ],
            active: {
                view: "unread",
                index: undefined,
            },
        },
        articles: [
            {
                title: "article1",
                host: "twitter.com",
                thumb: "images/dummy_image.png",
            },
            {
                title: "article2",
                host: "pixiv.net",
                thumb: "images/dummy_image.png",
            },
            {
                title: "article3",
                host: "hatena.ne.jp",
                thumb: "images/dummy_image.png",
            },
            {
                title: "長いタイトルあああああああああああああああああああああああああああああああああ",
                host: "twitter.com",
                thumb: "images/dummy_image.png",
            },
        ],
        searchArticle: "",
    };
    /* tslint:enable:object-literal-sort-keys */
});

ipcMain.on("get-unread-articles", (event) => {
    /* tslint:disable:object-literal-sort-keys */
    const articles = [
        {
            title: "article1",
            host: "twitter.com",
            thumb: "images/dummy_image.png",
        },
        {
            title: "article2",
            host: "pixiv.net",
            thumb: "images/dummy_image.png",
        },
        {
            title: "article3",
            host: "hatena.ne.jp",
            thumb: "images/dummy_image.png",
        },
        {
            title: "長いタイトルあああああああああああああああああああああああああああああああああ",
            host: "twitter.com",
            thumb: "images/dummy_image.png",
        },
    ];
    /* tslint:enable:object-literal-sort-keys */

    event.sender.send("update-articles", articles);
});

ipcMain.on("get-favorite-articles", (event) => {
    /* tslint:disable:object-literal-sort-keys */
    const articles = [
        {
            title: "article1",
            host: "twitter.com",
            thumb: "images/dummy_image.png",
        },
    ];
    /* tslint:enable:object-literal-sort-keys */

    event.sender.send("update-articles", articles);
});

ipcMain.on("get-archive-articles", (event) => {
    /* tslint:disable:object-literal-sort-keys */
    const articles = [
        {
            title: "article4",
            host: "twitter.com",
            thumb: "images/dummy_image.png",
        },
        {
            title: "article5",
            host: "pixiv.net",
            thumb: "images/dummy_image.png",
        },
    ];
    /* tslint:enable:object-literal-sort-keys */

    event.sender.send("update-articles", articles);
});

ipcMain.on("get-host-articles", (event, index) => {
    let articles;

    /* tslint:disable:object-literal-sort-keys */
    switch (index) {
        case 0:
            articles = [
                {
                    title: "article1",
                    host: "twitter.com",
                    thumb: "images/dummy_image.png",
                },
            ];
            break;
        case 1:
            articles = [
                {
                    title: "article2",
                    host: "pixiv.net",
                    thumb: "images/dummy_image.png",
                },
            ];
            break;
        case 2:
            articles = [
                {
                    title: "article3",
                    host: "hatena.ne.jp",
                    thumb: "images/dummy_image.png",
                },
                {
                    title: "長いタイトルあああああああああああああああああああああああああああああああああ",
                    host: "twitter.com",
                    thumb: "images/dummy_image.png",
                },
            ];
            break;
    }
    /* tslint:enable:object-literal-sort-keys */

    event.sender.send("update-articles", articles);
});

ipcMain.on("get-tag-articles", (event, index) => {
    let articles;

    /* tslint:disable:object-literal-sort-keys */
    switch (index) {
        case 0:
            articles = [
                {
                    title: "article3",
                    host: "hatena.ne.jp",
                    thumb: "images/dummy_image.png",
                },
            ];
            break;
        case 1:
            articles = [];
            break;
    }
    /* tslint:enable:object-literal-sort-keys */

    event.sender.send("update-articles", articles);
});
