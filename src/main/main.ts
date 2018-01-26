import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import { app, BrowserWindow, ipcMain } from "electron";
import * as inversify from "inversify";

import IPCPromiseReceiver from "../ipcPromise/ipcPromiseReceiver";
import IArticleRepository from "./interface/IArticleRepository";
import PocketAuth from "./pocketAuth";

import initContainer from "./inversify.config";
import TYPES from "./types";

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

let container: inversify.Container;

app.on("ready", async () => {
    container = await initContainer();

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

const ipcPromiseReceiver = new IPCPromiseReceiver();

const articleConverter = (article) => {
    /* tslint:disable:object-literal-sort-keys */
    return {
        title: article.title,
        host: article.host,
        thumb: "images/dummy_image.png",
    };
    /* tslint:enable:object-literal-sort-keys */
};

ipcPromiseReceiver.on("get-unread-articles", async (payload, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findUnread()).map(articleConverter);

    callback(articles);
});

ipcPromiseReceiver.on("get-favorite-articles", async (payload, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findFavorite()).map(articleConverter);

    callback(articles);
});

ipcPromiseReceiver.on("get-archive-articles", async (payload, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findArchive()).map(articleConverter);

    callback(articles);
});

ipcPromiseReceiver.on("get-host-articles", async (host, callback) => {
    console.log(host);
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findByHost(host)).map(articleConverter);

    callback(articles);
});

ipcPromiseReceiver.on("get-tag-articles", async (tag, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findByTag(tag)).map(articleConverter);

    callback(articles);
});
