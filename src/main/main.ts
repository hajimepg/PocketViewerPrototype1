import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import { app, BrowserWindow, ipcMain } from "electron";
import * as inversify from "inversify";

import IPCPromiseReceiver from "../ipcPromise/ipcPromiseReceiver";
import { IArticleRepository } from "./interface/IArticleRepository";
import PocketAuth from "./pocketAuth";

import initContainer from "./inversify.config";
import TYPES from "./types";

const ipcPromiseReceiver = new IPCPromiseReceiver();

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

ipcMain.on("sync-is-authenticate", (event) => {
    event.returnValue = false;
});

let accessToken: string = "";

ipcPromiseReceiver.on("pocket-auth", async (payload, callback) => {
    const authCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../credentials.json"), "utf-8"));

    const pocketAuth = new PocketAuth(authCredentials.pocket.consumer_key);

    pocketAuth.getAccessToken()
        .then((newAccessToken) => {
            accessToken = newAccessToken;

            if (window !== null) {
                window.show();
            }
            callback(null);
        })
        .catch((error: Error) => {
            callback(error.message);
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

ipcPromiseReceiver.on("get-views", async (payload, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const homeCount = (await articleRepository.findHome()).length;

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

    callback({ homeCount, hosts, tags });
});

ipcPromiseReceiver.on("get-home-articles", async (payload, callback) => {
    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = (await articleRepository.findHome()).map(articleConverter);

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

ipcPromiseReceiver.on("update-articles", async (payload, callback) => {
    console.log("update-articles");

    const articleRepository = container.get<IArticleRepository>(TYPES.ArticleRepository);

    const articles = await articleRepository.findAll();

    const id = (articles.length > 0) ? Math.max(...articles.map((article) => article.id)) + 1 : 1;

    /* tslint:disable:object-literal-sort-keys */
    await articleRepository.insert({
        id,
        title: `new record ${id}`,
        url: `http://example.com/${id}`,
        host: "example.com",
        tags: [`tag${id}`],
        isUnread: true,
        isFavorite: false,
        isArchive: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    callback(undefined);
});
