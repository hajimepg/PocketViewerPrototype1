import * as DataStore from "nedb";

import IArticleRepository from "../interface/IArticleRepository";
import Article from "../model/article";

export default class NeDbArticleRepository implements IArticleRepository {
    protected db;

    public constructor() {
        this.db = new DataStore({ filename: "db/article.db" });
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

    public insert(title: string, url: string, tags: string[], isUnread: boolean, isFavorite: boolean) {
        return new Promise<Article>((resolve, reject) => {
            this.db.insert({ title, url, tags, isUnread, isFavorite }, (error, doc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(new Article(doc._id, doc.title, doc.url, doc.host, doc.tags, doc.isUnread, doc.isFavorite));
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

                resolve(new Article(doc._id, doc.title, doc.url, doc.host, doc.tags, doc.isUnread, doc.isFavorite));
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
        return this.findArticles({ isUnread: false });
    }

    public findByHost(host: string) {
        return this.findArticles({ host });
    }

    public findByTag(tag: string) {
        return this.findArticles({ tags: { $elemMatch: tag } });
    }

    public findHosts() {
        return new Promise<string[]>((resolve, reject) => {
            this.db.find({ isUnread: true }, { host: 1 }, (error, docs) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                const result = new Array<string>();

                for (const doc of docs) {
                    if (result.indexOf(doc.host) !== -1) {
                        result.push(doc);
                    }
                }

                resolve(result);
            });
        });
    }

    public findTags() {
        return new Promise<string[]>((resolve, reject) => {
            this.db.find({ isUnread: true }, { tags: 1 }, (error, docs) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                const result = new Array<string>();

                for (const doc of docs) {
                    for (const tag in doc.tags) {
                        if (result.indexOf(tag) !== -1) {
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
            this.db.find(query, (error, docs) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(docs.map((doc) => {
                    return new Article(doc._id, doc.title, doc.url, doc.host, doc.tags, doc.isUnread, doc.isFavorite);
                }));
            });
        });
    }
}
