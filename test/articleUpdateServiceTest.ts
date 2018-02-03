import "reflect-metadata";

import * as inversify from "inversify";
import * as td from "testdouble";

import { contexualize } from "./testHelper";

import { IArticleRepository } from "../src/main/interface/IArticleRepository";
import IPocketGateway from "../src/main/interface/IPocketGateway";

import PocketGateway from "../src/main/gateway/PocketGateway";
import Article from "../src/main/model/article";
import { PocketArticle } from "../src/main/model/pocketArticle";
import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";
import ArticleUpdateService from "../src/main/service/articleUpdateService";

import TYPES from "../src/main/types";

const test = contexualize(() => {
    const container = new inversify.Container();

    let articleRepository = new NeDbArticleRepository();
    articleRepository = td.object(articleRepository);
    container.bind<IArticleRepository>(TYPES.ArticleRepository).toConstantValue(articleRepository);

    let pocketGateway = new PocketGateway();
    pocketGateway = td.object(pocketGateway);
    container.bind<IPocketGateway>(TYPES.PocketGateway).toConstantValue(pocketGateway);

    container.bind<ArticleUpdateService>(TYPES.ArticleUpdateService).to(ArticleUpdateService);

    const service = container.get<ArticleUpdateService>(TYPES.ArticleUpdateService);

    return { articleRepository, pocketGateway, service };
});

interface IArticleFactoryData {
    id?: string;
    title?: string;
    url?: string;
    host?: string;
    tags?: string[];
    isUnread?: boolean;
    isFavorite?: boolean;
    isArchive?: boolean;
    addedAt?: Date;
    itemId?: number;
}

function ArticleFactory(data: IArticleFactoryData): Article {
    const id = data.id || "id";
    const title = data.title || "title";
    const url = data.url || "http://example.com/";
    const host = data.host || "example.com";
    const tags = data.tags || [];
    const isUnread = data.isUnread || false;
    const isFavorite = data.isFavorite || false;
    const isArchive = data.isFavorite || false;
    const addedAt = data.addedAt || new Date();
    const itemId = data.itemId || 1;

    return new Article(id, title, url, host, tags, isUnread, isFavorite, isArchive, addedAt, itemId);
}

interface IPocketArticleFactoryData {
    itemId?: number;
    resolvedId?: number;
    givenUrl?: string;
    givenTitle?: string;
    favorite?: boolean;
    status?: "normal" | "archived" | "deleted";
    timeAdded?: Date;
    timeUpdated?: Date;
    timeRead?: Date | null;
    timeFavorited?: Date | null;
    sortId?: string;
    resolvedTitle?: string;
    resolvedUrl?: string;
    excerpt?: string;
    isArticle?: boolean;
    isIndex?: string;
    hasVideo?: "none" | "has in" | "is";
    hasImage?: "none" | "has in" | "is";
    wordCount?: number;
}

function PocketArticleFactory(data: IPocketArticleFactoryData): PocketArticle {
    // tslint:disable:object-literal-sort-keys
    return new PocketArticle({
        itemId: data.itemId || 1,
        resolvedId: data.resolvedId || 1,
        givenUrl: data.givenUrl || "http://www.example.com/givenUrl",
        givenTitle: data.givenTitle || "title",
        favorite: data.favorite || false,
        status: data.status || "normal",
        timeAdded: data.timeAdded || new Date(),
        timeUpdated: data.timeUpdated || new Date(),
        timeRead: data.timeRead || null,
        timeFavorited: data.timeFavorited || null,
        sortId: data.sortId || "sortId",
        resolvedTitle: data.resolvedTitle || "resolvedTitle",
        resolvedUrl: data.resolvedUrl || "http://www.example.com/resolvedUrl",
        excerpt: data.excerpt || "excerpt",
        isArticle: data.isArticle || true,
        isIndex: data.isIndex || "isIndex",
        hasVideo: data.hasVideo || "none",
        hasImage: data.hasImage || "none",
        wordCount: data.wordCount || 0,
    });
    // tslint:enabled:object-literal-sort-keys
}

test("new Data", async (t) => {
    const itemId = 1;
    const favorite = true;
    const resolvedTitle = "resolvedTitle";
    const resolvedUrl = "http://www.example.com/resolvedUrl";
    const timeAdded = new Date();

    td.when(t.context.articleRepository.findByItemId(itemId))
        .thenResolve(null);

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId,
                favorite,
                resolvedTitle,
                resolvedUrl,
                status: "normal",
                timeAdded,
            }),
        ]);

    await t.context.service.update();

    t.notThrows(() => {
        // tslint:disable:object-literal-sort-keys
        td.verify(t.context.articleRepository.insert({
            itemId,
            title: resolvedTitle,
            url: resolvedUrl,
            host: "example.com",
            tags: [],
            isFavorite: favorite,
            isUnread: true,
            isArchive: false,
            addedAt: timeAdded,
        }));
        // tslint:enabled:object-literal-sort-keys
    });
});

test("update to archive", async (t) => {
    const itemId = 1;

    td.when(t.context.articleRepository.findByItemId(itemId))
        .thenResolve(
            ArticleFactory({
                itemId,
                isArchive: false,
            })
        );

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId,
                status: "archived",
            }),
        ]);

    await t.context.service.update();

    t.notThrows(() => {
        td.verify(t.context.articleRepository.update(
            td.matchers.argThat((article: Article) => {
                return article.isArchive === true;
            })
        ));
    });
});
