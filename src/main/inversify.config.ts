import "reflect-metadata";

import * as inversify from "inversify";

import TYPES from "./types";

import { IArticleRepository } from "./interface/IArticleRepository";

import NeDbArticleRepository from "./repository/neDbArticleRepository";

export default async function initContainer(): Promise<inversify.Container> {
    const container = new inversify.Container();

    const articleRepository = new NeDbArticleRepository({ filename: "db/article.db" });
    await articleRepository.init();
    container.bind<IArticleRepository>(TYPES.ArticleRepository).toConstantValue(articleRepository);

    return container;
}
