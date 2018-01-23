import test from "ava";

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
