import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import { app, BrowserView, BrowserWindow, ipcMain } from "electron";
import * as inversify from "inversify";

import IPCPromiseReceiver from "../ipcPromise/ipcPromiseReceiver";
import { IArticleRepository } from "./interface/IArticleRepository";
import IPocketGateway from "./interface/IPocketGateway";
import { Article } from "./model/article";
import PocketAuth from "./pocketAuth";
import ArticleUpdateService from "./service/articleUpdateService";

import initContainer from "./inversify.config";
import TYPES from "./types";

const ipcPromiseReceiver = new IPCPromiseReceiver();

let window: BrowserWindow | null;

function createWindow() {
    window = new BrowserWindow({ width: 1280, height: 800 });

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

let browserView: BrowserView | null;

function createBrowserView() {
    if (window === null) {
        return;
    }

    const browserWindowX = 580;
    const browserWindowY = 50;
    const windowContentsBounds = window.getContentBounds();
    browserView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
        },
    });
    window.setBrowserView(browserView);
    browserView.setBounds({
        height: windowContentsBounds.height - browserWindowY,
        width: windowContentsBounds.width - browserWindowX,
        x: browserWindowX,
        y: browserWindowY,
    });
    browserView.setAutoResize({ height: true, width: true });
    browserView.webContents.loadURL("https://www.google.co.jp/");
}

let container: inversify.Container;

app.on("ready", async () => {
    const authCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../credentials.json"), "utf-8"));

    container = await initContainer(authCredentials.pocket.consumer_key);

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
                createBrowserView();
            }
            callback(null);
        })
        .catch((error: Error) => {
            callback(error.message);
        });
});

ipcPromiseReceiver.on("load-in-browser-view", async (loadUrl, callback) => {
    if (browserView !== null) {
        browserView.webContents.loadURL(loadUrl);
    }

    callback(null);
});

const articleConverter = (article: Article) => {
    /* tslint:disable:object-literal-sort-keys */
    return {
        id: article.id,
        title: article.title,
        url: article.url,
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
    const articleUpdateService = container.get<ArticleUpdateService>(TYPES.ArticleUpdateService);

    try {
        await articleUpdateService.update(accessToken);
        callback(undefined);
    }
    catch (error) {
        console.log(error);
    }
});
