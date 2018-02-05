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
                const savedArticle = await this.repository.findByItemId(article.itemId);

                if (savedArticle === null) {
                    if (article.status === "deleted") {
                        continue;
                    }

                    // tslint:disable:object-literal-sort-keys
                    await this.repository.insert({
                        itemId: article.itemId,
                        title: article.resolvedTitle,
                        url: article.resolvedUrl,
                        host: "example.com",
                        tags: [], // TODO: implement
                        isFavorite: article.favorite,
                        isUnread: article.status === "normal",
                        isArchive: article.status === "archived",
                        addedAt: article.timeAdded,
                    });
                    // tslint:enabled:object-literal-sort-keys

                    continue;
                }

                if (article.status === "deleted") {
                    await this.repository.delete(savedArticle);
                }
                else {
                    savedArticle.isArchive = article.status === "archived";

                    await this.repository.update(savedArticle);
                }
            }

            resolve();
        });
    }
}
