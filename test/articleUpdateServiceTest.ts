import "reflect-metadata";

import * as inversify from "inversify";
import * as td from "testdouble";

import { contexualize } from "./testHelper";

import { IArticleRepository } from "../src/main/interface/IArticleRepository";
import IPocketGateway from "../src/main/interface/IPocketGateway";

import PocketGateway from "../src/main/gateway/PocketGateway";
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
    await t.notThrows(
        t.context.service.update()
    );
});
