import test from "ava";

import Article from "../src/main/model/article";
import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";

test.beforeEach((t) => {
    t.context.repo  = new NeDbArticleRepository();
    t.context.repo.init();
    t.context.repo.deleteAll();
});

test.serial(async (t) => {
    const article = await t.context.repo.insert("title", "http://example.com", "example.com",
        ["Game", "Programming"], true, false);
    t.true(article.id.length > 0);
    t.is("title", article.title);
    t.is("http://example.com", article.url);
    t.is("example.com", article.host);
    t.is(2, article.tags.length);
    t.not(-1, article.tags.indexOf("Game"));
    t.not(-1, article.tags.indexOf("Programming"));
    t.true(article.isUnread);
    t.false(article.isFavorite);
});

test.serial(async (t) => {
    await t.context.repo.insert("title1", "http://example.com", "example.com", [], true, false);
    await t.context.repo.insert("title2", "http://example.com", "example.com", [], false, false);
    await t.context.repo.insert("title3", "http://example.com", "example.com", [], true, false);

    const articles: Article[] = await t.context.repo.findUnread();
    t.is(2, articles.length);
    const titles = articles.map((article) => article.title);
    t.not(-1, titles.indexOf("title1"));
    t.not(-1, titles.indexOf("title3"));
});
