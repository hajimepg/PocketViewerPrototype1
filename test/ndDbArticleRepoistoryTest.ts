import test from "ava";

import Article from "../src/main/model/article";
import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";

test.beforeEach((t) => {
    t.context.repo  = new NeDbArticleRepository();
    t.context.repo.init();
    t.context.repo.deleteAll();
});

test.serial(async (t) => {
    const article = await t.context.repo.insert("title", "http://example.com", [], true, false);
    t.is("title", article.title);
    t.is("http://example.com", article.url);
    t.is(0, article.tags.length);
    t.true(article.isUnread);
    t.false(article.isFavorite);
});

test.serial(async (t) => {
    await t.context.repo.insert("title1", "http://example.com", [], true, false);
    await t.context.repo.insert("title2", "http://example.com", [], false, false);
    await t.context.repo.insert("title3", "http://example.com", [], true, false);

    const articles: Article[] = await t.context.repo.findUnread();
    t.is(2, articles.length);
    const titles = articles.map((article) => article.title);
    t.not(-1, titles.indexOf("title1"));
    t.not(-1, titles.indexOf("title3"));
});
