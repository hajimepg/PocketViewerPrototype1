import assert from "assert";
import { URL } from "url";

import { inject, injectable } from "inversify";

import { IArticleRepository } from "../interface/IArticleRepository";
import IPocketGateway from "../interface/IPocketGateway";
import { Article } from "../model/article";
import TYPE from "../types";

@injectable()
export default class ArticleUpdateService {
    public constructor(
        @inject(TYPE.ArticleRepository) protected repository: IArticleRepository,
        @inject(TYPE.PocketGateway) protected gateway: IPocketGateway
    ) {
    }

    public update(accessToken: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const articles = await this.gateway.retrieve(accessToken);

            for (const article of articles) {
                const articleUrl = new URL(article.preferredUrl);

                // tslint:disable:object-literal-sort-keys
                const newArticle = new Article({
                    id: article.itemId,
                    title: article.preferredTitle,
                    url: article.preferredUrl,
                    host: articleUrl.hostname,
                    tags: [], // TODO: implement
                    isFavorite: article.favorite,
                    isUnread: article.timeRead === null,
                    isArchive: article.status === "archived",
                    addedAt: article.timeAdded,
                });
                // tslint:enabled:object-literal-sort-keys

                const savedArticle = await this.repository.findById(article.itemId);

                if (article.status === "deleted") {
                    if (savedArticle !== null) {
                        await this.repository.delete(savedArticle);
                    }
                }
                else {
                    if (savedArticle === null) {
                        await this.repository.insert(newArticle);
                    }
                    else {
                        switch (newArticle.isUpdated(savedArticle)) {
                            case "updated":
                                await this.repository.update(newArticle);
                                break;
                            case "no updated":
                                // do nothing
                                break;
                            case "different id":
                                assert.fail(
                                    savedArticle.id, newArticle.id,
                                    // tslint:disable-next-line:max-line-length
                                    `try to update a different article. (actual: ${savedArticle.id}, expected: ${newArticle.id})`
                                );
                                break;
                        }
                    }
                }
            }

            resolve();
        });
    }
}
