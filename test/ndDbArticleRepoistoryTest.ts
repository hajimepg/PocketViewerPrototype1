import { contexualize } from "./testHelper";

import Article from "../src/main/model/article";
import NeDbArticleRepository from "../src/main/repository/neDbArticleRepository";

const test = contexualize(() => {
    return {
        repo: new NeDbArticleRepository(),
    };
});

test.beforeEach(async (t) => {
    t.context.repo = new NeDbArticleRepository();
    t.context.repo.init();
});

test("insert", async (t) => {
    const addedAt = new Date();
    /* tslint:disable:object-literal-sort-keys */
    const article = await t.context.repo.insert({
        itemId: 1,
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
    t.is(1, article.itemId);
});

test("update", async (t) => {
    /* tslint:disable:object-literal-sort-keys */
    const article = await t.context.repo.insert({
        itemId: 1,
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
    article.itemId = 2;

    const updatedArticle = await t.context.repo.update(article);
    t.is(article.id, updatedArticle.id);
    t.is(article.url, updatedArticle.url);
    t.is(article.host, updatedArticle.host);
    t.deepEqual(article.tags, updatedArticle.tags);
    t.is(article.isUnread, updatedArticle.isUnread);
    t.is(article.isFavorite, updatedArticle.isFavorite);
    t.is(article.addedAt, updatedArticle.addedAt);
    t.is(article.itemId, updatedArticle.itemId);
});

test("delete", async (t) => {
    /* tslint:disable:object-literal-sort-keys */
    const article1 = await t.context.repo.insert({
        itemId: 1,
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    const article2 = await t.context.repo.insert({
        itemId: 2,
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    const article3 = await t.context.repo.insert({
        itemId: 3,
        title: "title3",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date(),
    });
    /* tslint:enable:object-literal-sort-keys */

    const allArticlesBefore = await t.context.repo.findAll();
    t.is(3, allArticlesBefore.length);

    await t.context.repo.delete(article2);

    const allArticlesAfter = await t.context.repo.findAll();
    t.is(2, allArticlesAfter.length);
    const ids = allArticlesAfter.map((article) => article.id);
    t.not(-1, ids.indexOf(article1.id));
    t.not(-1, ids.indexOf(article3.id));
});

test("findUnread", async (t) => {
    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 1,
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/01"),
    });
    await t.context.repo.insert({
        itemId: 2,
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: false,
        isFavorite: false,
        addedAt: new Date("2018/01/02"),
    });
    await t.context.repo.insert({
        itemId: 3,
        title: "title3",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/03"),
    });
    /* tslint:enable:object-literal-sort-keys */

    const articles = await t.context.repo.findUnread();
    t.is(2, articles.length);
    const titles = articles.map((article) => article.title);
    t.is("title3", articles[0].title);
    t.is("title1", articles[1].title);
});

test("findByTag", async (t) => {
    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 1,
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/01"),
    });
    await t.context.repo.insert({
        itemId: 2,
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: ["Game"],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/02"),
    });
    await t.context.repo.insert({
        itemId: 3,
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
        const articles = await t.context.repo.findByTag("Game");
        t.is(2, articles.length);
        const titles = articles.map((article) => article.title);
        t.is("title3", articles[0].title);
        t.is("title2", articles[1].title);
    }

    {
        const articles = await t.context.repo.findByTag("Programming");
        t.is(1, articles.length);
        const titles = articles.map((article) => article.title);
        t.is("title3", articles[0].title);
    }

    {
        const articles = await t.context.repo.findByTag("Anime");
        t.is(0, articles.length);
    }
});

test("findByItemId", async (t) => {
    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 1,
        title: "title1",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: true,
        isFavorite: false,
        addedAt: new Date("2018/01/01"),
    });
    await t.context.repo.insert({
        itemId: 2,
        title: "title2",
        url: "http://example.com",
        host: "example.com",
        tags: [],
        isUnread: false,
        isFavorite: false,
        addedAt: new Date("2018/01/02"),
    });
    /* tslint:enable:object-literal-sort-keys */

    {
        const article = await t.context.repo.findByItemId(1);
        t.not(article, null);
        t.is((article as Article).title, "title1");
    }

    {
        const article = await t.context.repo.findByItemId(2);
        t.not(article, null);
        t.is((article as Article).title, "title2");
    }

    {
        const article = await t.context.repo.findByItemId(3);
        t.is(article, null);
    }
});

test("findHosts", async (t) => {
    {
        const hosts = await t.context.repo.findHosts();
        t.is(0, hosts.length);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 1,
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
        const hosts = await t.context.repo.findHosts();
        t.is(1, hosts.length);
        t.is("example.com", hosts[0]);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 2,
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
        const hosts = await t.context.repo.findHosts();
        t.is(2, hosts.length);
        t.is("example.com", hosts[0]);
        t.is("example.net", hosts[1]);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 3,
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
        const hosts = await t.context.repo.findHosts();
        t.is(2, hosts.length);
        t.is("example.com", hosts[0]);
        t.is("example.net", hosts[1]);
    }
});

test("findTags", async (t) => {
    {
        const tags = await t.context.repo.findTags();
        t.is(0, tags.length);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 1,
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
        const tags = await t.context.repo.findTags();
        t.is(0, tags.length);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 2,
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
        const tags = await t.context.repo.findTags();
        t.is(1, tags.length);
        t.is("tag1", tags[0]);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 3,
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
        const tags = await t.context.repo.findTags();
        t.is(3, tags.length);
        t.is("tag1", tags[0]);
        t.is("tag2", tags[1]);
        t.is("tag3", tags[2]);
    }

    /* tslint:disable:object-literal-sort-keys */
    await t.context.repo.insert({
        itemId: 4,
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
        const tags = await t.context.repo.findTags();
        t.is(4, tags.length);
        t.is("tag1", tags[0]);
        t.is("tag2", tags[1]);
        t.is("tag3", tags[2]);
        t.is("tag4", tags[3]);
    }
});
