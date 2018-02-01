import "reflect-metadata";

import test from "ava";
import * as inversify from "inversify";

import { IArticleRepository } from "../src/main/interface/IArticleRepository";
import IPocketGateway from "../src/main/interface/IPocketGateway";

import PocketGateway from "../src/main/gateway/PocketGateway";
import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";
import ArticleUpdateService from "../src/main/service/articleUpdateService";

import TYPES from "../src/main/types";

test.beforeEach(async (t) => {
    const container = new inversify.Container();

    const articleRepository = new NeDbArticleRepository();
    await articleRepository.init();
    container.bind<IArticleRepository>(TYPES.ArticleRepository).toConstantValue(articleRepository);

    container.bind<IPocketGateway>(TYPES.PocketGateway).to(PocketGateway);

    container.bind<ArticleUpdateService>(TYPES.ArticleUpdateService).to(ArticleUpdateService);

    t.context.container = container;
});

test("ArticleUpdateServiceTest::update", async (t) => {
    const service = (t.context.container as inversify.Container).get<ArticleUpdateService>(TYPES.ArticleUpdateService);

    await t.notThrows(
        service.update()
    );
});
