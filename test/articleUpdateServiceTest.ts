import "reflect-metadata";

import * as inversify from "inversify";
import * as td from "testdouble";

import { contexualize } from "./testHelper";

import { IArticleRepository } from "../src/main/interface/IArticleRepository";
import IPocketGateway from "../src/main/interface/IPocketGateway";

import PocketGateway from "../src/main/gateway/PocketGateway";
import { Article } from "../src/main/model/article";
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
    id?: number;
    title?: string;
    url?: string;
    host?: string;
    tags?: string[];
    isUnread?: boolean;
    isFavorite?: boolean;
    isArchive?: boolean;
    addedAt?: Date;
}

function ArticleFactory(data: IArticleFactoryData): Article {
    const id = data.id || 1;
    const title = data.title || "title";
    const url = data.url || "http://example.com/";
    const host = data.host || "example.com";
    const tags = data.tags || [];
    const isUnread = data.isUnread || false;
    const isFavorite = data.isFavorite || false;
    const isArchive = data.isArchive || false;
    const addedAt = data.addedAt || new Date();

    return new Article({ id, title, url, host, tags, isUnread, isFavorite, isArchive, addedAt });
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
    const id = 1;
    const favorite = true;
    const resolvedTitle = "resolvedTitle";
    const resolvedUrl = "http://www.example.com/resolvedUrl";
    const timeAdded = new Date();

    td.when(t.context.articleRepository.findById(id))
        .thenResolve(null);

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId: id,
                favorite,
                resolvedTitle,
                resolvedUrl,
                status: "normal",
                timeAdded,
            }),
        ]);

    await t.context.service.update();

    t.notThrows(() => {
        td.verify(t.context.articleRepository.insert(
            td.matchers.argThat((article: Article) => {
                return article.id === id
                    && article.title === resolvedTitle
                    && article.url === resolvedUrl
                    && article.host === "example.com"
                    && article.tags.length === 0
                    && article.isFavorite === favorite
                    && article.isUnread === true
                    && article.addedAt === timeAdded;
            })
        ));
    });
});

test("update to archive", async (t) => {
    const id = 1;

    td.when(t.context.articleRepository.findById(id))
        .thenResolve(
            ArticleFactory({
                id,
                isArchive: false,
            })
        );

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId: id,
                status: "archived",
            }),
        ]);

    await t.context.service.update();

    t.notThrows(() => {
        td.verify(t.context.articleRepository.update(
            td.matchers.argThat((article: Article) => {
                return article.id === id
                   &&  article.isArchive === true;
            })
        ));
    });
});

test("saved archive is deleted", async (t) => {
    const id = 1;

    td.when(t.context.articleRepository.findById(id))
        .thenResolve(
            ArticleFactory({
                id,
                isArchive: false,
            })
        );

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId: id,
                status: "deleted",
            }),
        ]);

    await t.context.service.update();

    t.notThrows(() => {
        td.verify(t.context.articleRepository.delete(
            td.matchers.argThat((article: Article) => {
                return article.id === id;
            })
        ));
    });
});

test("unsaved archive is deleted", async (t) => {
    const id = 1;

    td.when(t.context.articleRepository.findById(id))
        .thenResolve(null);

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId: id,
                status: "deleted",
            }),
        ]);

    await t.context.service.update();

    t.is(0, td.explain(t.context.articleRepository.insert).callCount);
    t.is(0, td.explain(t.context.articleRepository.update).callCount);
    t.is(0, td.explain(t.context.articleRepository.delete).callCount);
});

test("nothing to update", async (t) => {
    const id = 1;
    const addedAt = new Date();
    const title = "title";
    const url = "http://www.example.com";
    const isUnread = true;

    td.when(t.context.articleRepository.findById(id))
        .thenResolve(
            ArticleFactory({
                id,
                addedAt,
                title,
                url,
                isUnread,
            })
        );

    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            PocketArticleFactory({
                itemId: id,
                timeAdded: addedAt,
                resolvedTitle: title,
                resolvedUrl: url,
                status: "normal",
            }),
        ]);

    await t.context.service.update();

    t.is(0, td.explain(t.context.articleRepository.insert).callCount);
    t.is(0, td.explain(t.context.articleRepository.update).callCount);
    t.is(0, td.explain(t.context.articleRepository.delete).callCount);
});
