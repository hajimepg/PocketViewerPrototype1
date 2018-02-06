import * as DataStore from "nedb";

import { IArticleRepository } from "../interface/IArticleRepository";
import { Article } from "../model/article";

function articleFactory(doc): Article {
    // tslint:disable:object-literal-sort-keys
    return new Article({
        id: doc._id,
        title: doc.title,
        url: doc.url,
        host: doc.host,
        tags: doc.tags,
        isUnread: doc.isUnread,
        isFavorite: doc.isFavorite,
        isArchive: doc.isArchive,
        addedAt: doc.addedAt,
    });
    // tslint:enable:object-literal-sort-keys
}

export default class NeDbArticleRepository implements IArticleRepository {
    protected db;

    public constructor(options = {}) {
        this.db = new DataStore(options);
    }

    public init() {
        return new Promise<void>((resolve, reject) => {
            this.db.loadDatabase((error) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    public insert(article: Article) {
        return new Promise<Article>((resolve, reject) => {
            // tslint:disable:object-literal-sort-keys
            const insertDoc = {
                _id: article.id,
                title: article.title,
                url: article.url,
                host: article.host,
                tags: article.tags,
                isUnread: article.isUnread,
                isFavorite: article.isFavorite,
                isArchive: article.isArchive,
                addedAt: article.addedAt
            };
            // tslint:enable:object-literal-sort-keys

            this.db.insert(insertDoc, (error, doc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(articleFactory(doc));
            });
        });
    }

    public update(article: Article) {
        return new Promise<Article>((resolve, reject) => {
            const query = { _id: article.id };
            const update = { ...article };
            const options = { returnUpdatedDocs: true };

            this.db.update(query, update, options, (error, numAffected, doc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(articleFactory(doc));
            });
        });
    }

    public deleteAll() {
        return new Promise<void>((resolve, reject) => {
            this.db.remove({}, { multi: true }, (error, numRemoved) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    public delete(article: Article) {
        return new Promise<void>((resolve, reject) => {
            this.db.remove( { _id: article.id }, {}, (error, numRemoved) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    public findAll() {
        return this.findArticles({});
    }

    public findUnread() {
        return this.findArticles({ isUnread: true });
    }

    public findFavorite() {
        return this.findArticles({ isFavorite: true });
    }

    public findArchive() {
        return this.findArticles({ isArchive: true });
    }

    public findByHost(host: string) {
        return this.findArticles({ host });
    }

    public findByTag(tag: string) {
        return this.findArticles({ tags: { $elemMatch: tag } });
    }

    public findById(id: number) {
        return new Promise<Article | null>((resolve, reject) => {
            this.db.findOne({ _id: id }, (error, doc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(doc);
            });
        });
    }

    public findHosts() {
        return new Promise<string[]>((resolve, reject) => {
            this.db.find({ isUnread: true }, { host: 1 }).sort({ host: 1 }).exec((error, docs) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                const result = new Array<string>();

                for (const doc of docs) {
                    if (result.indexOf(doc.host) === -1) {
                        result.push(doc.host);
                    }
                }

                resolve(result);
            });
        });
    }

    public findTags() {
        return new Promise<string[]>((resolve, reject) => {
            this.db.find({ isUnread: true }, { tags: 1 }).sort({ tags: 1 }).exec((error, docs) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                const result = new Array<string>();

                for (const doc of docs) {
                    for (const tag of doc.tags) {
                        if (result.indexOf(tag) === -1) {
                            result.push(tag);
                        }
                    }
                }

                resolve(result);
            });
        });
    }

    protected findArticles(query) {
        return new Promise<Article[]>((resolve, reject) => {
            this.db.find(query).sort({ addedAt: -1 }).exec((error, docs) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(docs.map(articleFactory));
            });
        });
    }
}
