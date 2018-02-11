import "reflect-metadata";

import * as inversify from "inversify";

import TYPES from "./types";

import { IArticleRepository } from "./interface/IArticleRepository";
import IPocketGateway from "./interface/IPocketGateway";

import PocketGateway from "./gateway/pocketGateway";
import NeDbArticleRepository from "./repository/neDbArticleRepository";
import ArticleUpdateService from "./service/articleUpdateService";

export default async function initContainer(consumerKey: string): Promise<inversify.Container> {
    const container = new inversify.Container();

    const articleRepository = new NeDbArticleRepository({ filename: "db/article.db" });
    await articleRepository.init();
    container.bind<IArticleRepository>(TYPES.ArticleRepository).toConstantValue(articleRepository);

    const pocketGateway = new PocketGateway(consumerKey);
    container.bind<IPocketGateway>(TYPES.PocketGateway).toConstantValue(pocketGateway);

    container.bind<ArticleUpdateService>(TYPES.ArticleUpdateService).to(ArticleUpdateService);

    return container;
}
