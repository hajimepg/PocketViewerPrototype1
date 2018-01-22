import test from "ava";

import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";

test(async (t) => {
    const repo = new NeDbArticleRepository();
    repo.init();
    const article = await repo.insert("title", "http://example.com", [], true, false);
    t.is("title", article.title);
    t.is("http://example.com", article.url);
    t.is(0, article.tags.length);
    t.true(article.isUnread);
    t.false(article.isFavorite);
});
