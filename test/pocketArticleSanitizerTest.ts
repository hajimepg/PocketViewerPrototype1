import test from "ava";

import * as Sanitizer from "../src/main/pocketArticleSanitizer";

test("PocketArticleSanitizer::basic", (t) => {
    t.notThrows(() => {
        // tslint:disable:object-literal-sort-keys
        const sanitizedArticle = Sanitizer.sanitize({
            item_id: "1",
            resolved_id: "2",
            given_url: "http://example.com",
            given_title: "given_title",
            favorite: "0",
            status: "0",
            time_added: "1517233597",
            time_updated: "1517233597",
            time_read: "0",
            time_favorited: "0",
            sort_id: "0",
            resolved_title: "0",
            resolved_url: "0",
            excerpt: "excerpt",
            is_article: "0",
            is_index: "0",
            has_video: "0",
            has_image: "0",
            word_count: "3",
        });
        // tslint:enable:object-literal-sort-keys
    });
});
