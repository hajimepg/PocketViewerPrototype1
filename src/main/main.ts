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

const articleConverter = (article) => {
    /* tslint:disable:object-literal-sort-keys */
    return {
        title: article.title,
        host: article.host,
        thumb: "images/dummy_image.png",
    };
    /* tslint:enable:object-literal-sort-keys */
};

ipcMain.on("sync-initial-state", async (event) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const unreadArticles = await articleRepository.findUnread();

    const hosts = Array<{ name: string, count: number}>();
    for (const host of (await articleRepository.findHosts())) {
        const count = (await articleRepository.findByHost(host)).length;
        hosts.push({ name: host, count });
    }

    const tags = Array<{ name: string, count: number}>();
    for (const tag of (await articleRepository.findTags())) {
        const count = (await articleRepository.findByTag(tag)).length;
        tags.push({ name: tag, count });
    }

    /* tslint:disable:object-literal-sort-keys */
    event.returnValue = {
        accessToken: "",
        authErrorMessage: "",
        views: {
            unread: {
                count: unreadArticles.length,
            },
            hosts,
            tags,
            active: {
                view: "unread",
                index: undefined,
            },
        },
        articles: unreadArticles.map(articleConverter),
        searchArticle: "",
    };
    /* tslint:enable:object-literal-sort-keys */
});

const ipcPromiseReceiver = new IPCPromiseReceiver();

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
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findByHost(host)).map(articleConverter);

    callback(articles);
});

ipcPromiseReceiver.on("get-tag-articles", async (tag, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findByTag(tag)).map(articleConverter);

    callback(articles);
});
