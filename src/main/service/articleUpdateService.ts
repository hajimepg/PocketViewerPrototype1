import { inject, injectable } from "inversify";

import { IArticleRepository } from "../interface/IArticleRepository";
import IPocketGateway from "../interface/IPocketGateway";
import TYPE from "../types";

@injectable()
export default class ArticleUpdateService {
    public constructor(
        @inject(TYPE.ArticleRepository) protected repository: IArticleRepository,
        @inject(TYPE.PocketGateway) protected gateway: IPocketGateway
    ) {
    }

    public update(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const articles = await this.gateway.retrieve();

            for (const article of articles) {
                // tslint:disable:object-literal-sort-keys
                this.repository.insert({
                    title: article.resolvedTitle,
                    url: article.resolvedUrl,
                    host: "example.com",
                    tags: [], // TODO: implement
                    isFavorite: article.favorite,
                    isUnread: article.status === "normal",
                    addedAt: article.timeAdded,
                });
                // tslint:enabled:object-literal-sort-keys
            }

            resolve();
        });
    }
}
