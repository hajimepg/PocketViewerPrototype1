import "reflect-metadata";

import * as inversify from "inversify";
import * as td from "testdouble";

import { contexualize } from "./testHelper";

import { IArticleRepository } from "../src/main/interface/IArticleRepository";
import IPocketGateway from "../src/main/interface/IPocketGateway";

import PocketGateway from "../src/main/gateway/PocketGateway";
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

test("update", async (t) => {
    const timeAdded = new Date();
    // tslint:disable:object-literal-sort-keys
    td.when(t.context.pocketGateway.retrieve())
        .thenResolve([
            new PocketArticle({
                itemId: 1,
                resolvedId: 1,
                givenUrl: "http://www.example.com/givenUrl",
                givenTitle: "title",
                favorite: false,
                status: "normal",
                timeAdded,
                timeUpdated: new Date(),
                timeRead: null,
                timeFavorited: null,
                sortId: "sortId",
                resolvedTitle: "resolvedTitle",
                resolvedUrl: "http://www.example.com/resolvedUrl",
                excerpt: "excerpt",
                isArticle: true,
                isIndex: "isIndex",
                hasVideo: "none",
                hasImage: "none",
                wordCount: 0,
            }),
        ]);
    // tslint:enabled:object-literal-sort-keys

    await t.context.service.update();

    t.notThrows(() => {
        // tslint:disable:object-literal-sort-keys
        td.verify(t.context.articleRepository.insert({
            title: "resolvedTitle",
            url: "http://www.example.com/resolvedUrl",
            host: "example.com",
            tags: [],
            isFavorite: false,
            isUnread: false,
            addedAt: timeAdded,
        }));
        // tslint:enabled:object-literal-sort-keys
    });
});
