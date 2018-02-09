import test from "ava";

import { Article, IArticleConstractorData } from "../src/main/model/article";

interface IArticleFactoryData {
    id?: number;
    title?: string;
    url?: string;
    host?: string;
    tags?: string[];
    isUnread?: boolean;
    isFavorite?: boolean;
    isArchive?: boolean;
    addedAt?: Date;
}

function ArticleFactory(data: IArticleFactoryData): Article {
    const id = data.id || 1;
    const title = data.title || "title";
    const url = data.url || "http://example.com/";
    const host = data.host || "example.com";
    const tags = data.tags || ["tag1", "tag2"];
    const isUnread = data.isUnread || false;
    const isFavorite = data.isFavorite || false;
    const isArchive = data.isArchive || false;
    const addedAt = data.addedAt || new Date("2018/01/01");

    return new Article({ id, title, url, host, tags, isUnread, isFavorite, isArchive, addedAt });
}

test("isUpdated(Same Object)", async (t) => {
    const article = ArticleFactory({});

    t.is("no updated", article.isUpdated(article));
});

test("isUpdated(Same Value)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({});

    t.is("no updated", article.isUpdated(otherArticle));
});

test("isUpdated(id)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ id: 2 });

    t.is("different id", article.isUpdated(otherArticle));
});

test("isUpdated(title)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ title: "other title" });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(url)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ url: "http://example.net/" });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(host)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ host: "example.net" });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(tags)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ tags: ["tag2", "tag3"] });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(isUnread)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ isUnread: true });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(isFavorite)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ isFavorite: true });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(isArchive)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ isArchive: true });

    t.is("updated", article.isUpdated(otherArticle));
});

test("isUpdated(addedAt)", async (t) => {
    const article = ArticleFactory({});
    const otherArticle = ArticleFactory({ addedAt: new Date("2018/01/02") });

    t.is("updated", article.isUpdated(otherArticle));
});
