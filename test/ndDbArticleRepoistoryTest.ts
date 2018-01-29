import test from "ava";

import Article from "../src/main/model/article";
import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";

test("insert", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    const addedAt = new Date();
    /* tslint:disable:object-literal-sort-keys */
    const article = await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: ["Game", "Programming"],
        isUnread: true,
        isFavorite: false,
        addedAt,
    });
    /* tslint:enable:object-literal-sort-keys */

    t.true(article.id.length > 0);
    t.is("title", article.title);
    t.is("http://example.com", article.url);
    t.is("example.com", article.host);
    t.is(2, article.tags.length);
    t.not(-1, article.tags.indexOf("Game"));
    t.not(-1, article.tags.indexOf("Programming"));
    t.true(article.isUnread);
    t.false(article.isFavorite);
    t.is(addedAt, article.addedAt);
});

test("update", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    /* tslint:disable:object-literal-sort-keys */
    const article = await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: ["Game", "Programming"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/01"),
    });
    /* tslint:enable:object-literal-sort-keys */

    article.url = "http://example.net";
    article.host = "example.net";
    article.tags.push("Anime");
    article.isUnread = false;
    article.isFavorite = true;
    article.addedAt = new Date();

    const updatedArticle = await repo.update(article);
    t.is(article.id, updatedArticle.id);
    t.is(article.url, updatedArticle.url);
    t.is(article.host, updatedArticle.host);
    t.deepEqual(article.tags, updatedArticle.tags);
    t.is(article.isUnread, updatedArticle.isUnread);
    t.is(article.isFavorite, updatedArticle.isFavorite);
    t.is(article.addedAt, updatedArticle.addedAt);
});

test("delete", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    /* tslint:disable:object-literal-sort-keys */
    const article1 = await repo.insert({
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    const article2 = await repo.insert({
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    const article3 = await repo.insert({
        title: "title3",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    const allArticlesBefore = await repo.findAll();
    t.is(3, allArticlesBefore.length);

    await repo.delete(article2);

    const allArticlesAfter = await repo.findAll();
    t.is(2, allArticlesAfter.length);
    const ids = allArticlesAfter.map((article) => article.id);
    t.not(-1, ids.indexOf(article1.id));
    t.not(-1, ids.indexOf(article3.id));
});

test("findUnread", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/01"),
    });
    await repo.insert({
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: false,
        isFavorite: false,
        addedAt: new Date("2018/01/02"),
    });
    await repo.insert({
        title: "title3",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/03"),
    });
    /* tslint:enable:object-literal-sort-keys */

    const articles = await repo.findUnread();
    t.is(2, articles.length);
    const titles = articles.map((article) => article.title);
    t.is("title3", articles[0].title);
    t.is("title1", articles[1].title);
});

test("findByTag", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/01"),
    });
    await repo.insert({
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: ["Game"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/02"),
    });
    await repo.insert({
        title: "title3",
        url: "http://example.com",
        host: "example.com",
        tags: ["Game", "Programming"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/03"),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const articles = await repo.findByTag("Game");
        t.is(2, articles.length);
        const titles = articles.map((article) => article.title);
        t.is("title3", articles[0].title);
        t.is("title2", articles[1].title);
    }

    {
        const articles = await repo.findByTag("Programming");
        t.is(1, articles.length);
        const titles = articles.map((article) => article.title);
        t.is("title3", articles[0].title);
    }

    {
        const articles = await repo.findByTag("Anime");
        t.is(0, articles.length);
    }
});

test("findHosts", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    {
        const hosts = await repo.findHosts();
        t.is(0, hosts.length);
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const hosts = await repo.findHosts();
        t.is(1, hosts.length);
        t.not(-1, hosts.indexOf("example.com"));
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.net",
        host: "example.net",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const hosts = await repo.findHosts();
        t.is(2, hosts.length);
        t.not(-1, hosts.indexOf("example.com"));
        t.not(-1, hosts.indexOf("example.net"));
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.com/another",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const hosts = await repo.findHosts();
        t.is(2, hosts.length);
        t.not(-1, hosts.indexOf("example.com"));
        t.not(-1, hosts.indexOf("example.net"));
    }
});

test("findTags", async (t) => {
    const repo = new NeDbArticleRepository();
    await repo.init();

    {
        const tags = await repo.findTags();
        t.is(0, tags.length);
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const tags = await repo.findTags();
        t.is(0, tags.length);
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: ["tag1"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const tags = await repo.findTags();
        t.is(1, tags.length);
        t.not(-1, tags.indexOf("tag1"));
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: ["tag2", "tag3"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const tags = await repo.findTags();
        t.is(3, tags.length);
        t.not(-1, tags.indexOf("tag1"));
        t.not(-1, tags.indexOf("tag2"));
        t.not(-1, tags.indexOf("tag3"));
    }

    /* tslint:disable:object-literal-sort-keys */
    await repo.insert({
        title: "title",
        url: "http://example.com",
        host: "example.com",
        tags: ["tag3", "tag4"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const tags = await repo.findTags();
        t.is(4, tags.length);
        t.not(-1, tags.indexOf("tag1"));
        t.not(-1, tags.indexOf("tag2"));
        t.not(-1, tags.indexOf("tag3"));
        t.not(-1, tags.indexOf("tag4"));
    }
});
