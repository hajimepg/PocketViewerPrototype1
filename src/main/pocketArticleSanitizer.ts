import { PocketArticle } from "./model/pocketArticle";
import RawPocketArticle from "./model/rawPocketArticle";

function parseStatus(status): "normal" | "archived" | "deleted" {
    switch (status) {
        case "0":
            return "normal";
        case "1":
            return "archived";
        case "2":
            return "deleted";
        default:
            throw new Error(`invalid status: ${status}`);
    }
}

function parseDate(unixTimeStampString: string): Date {
    return new Date(parseInt(unixTimeStampString, 10) * 1000);
}

function parseNullableDate(unixTimeStampString: string): Date | null {
    return (unixTimeStampString === "0") ? null : parseDate(unixTimeStampString as string);
}

function parseHasVideo(hasVideo): "none" | "has in" | "is" {
    if (hasVideo === undefined) {
        return "none";
    }

    switch (hasVideo) {
        case "0":
            return "none";
        case "1":
            return "has in";
        case "2":
            return "is";
        default:
            throw new Error(`invalid has_video: ${hasVideo}`);
    }
}

function parseHasImage(hasImage): "none" | "has in" | "is" {
    if (hasImage === undefined) {
        return "none";
    }

    switch (hasImage) {
        case "0":
            return "none";
        case "1":
            return "has in";
        case "2":
            return "is";
        default:
            throw new Error(`invalid has_image: ${hasImage}`);
    }
}

export function sanitize(raw: RawPocketArticle): PocketArticle {
    // TODO: ちゃんとサニタイズを実装する
    const itemId = parseInt(raw.item_id as string, 10);
    const resolvedId = parseInt(raw.resolved_id as string, 10);
    const givenUrl = raw.resolved_url as string;
    const givenTitle = raw.given_title as string;
    const favorite = (raw.favorite === "1");
    const status = parseStatus(raw.status);
    const timeAdded = parseDate(raw.time_added as string);
    const timeUpdated = parseDate(raw.time_updated as string);
    const timeRead = parseNullableDate(raw.time_read as string);
    const timeFavorited = parseNullableDate(raw.time_favorited as string);
    const sortId = raw.sort_id as string;
    const resolvedTitle = raw.resolved_title as string;
    const resolvedUrl = raw.resolved_url as string;
    const excerpt = raw.excerpt as string;
    const isArticle = (raw.is_article === "1");
    const isIndex = raw.is_index as string;
    const hasVideo = parseHasVideo(raw.has_video);
    const hasImage = parseHasImage(raw.has_image);
    const wordCount = parseInt(raw.word_count as string, 10);

    // tslint:disable:object-literal-sort-keys
    return new PocketArticle({
        itemId,
        resolvedId,
        givenUrl,
        givenTitle,
        favorite,
        status,
        timeAdded,
        timeUpdated,
        timeRead,
        timeFavorited,
        sortId,
        resolvedTitle,
        resolvedUrl,
        excerpt,
        isArticle,
        isIndex,
        hasVideo,
        hasImage,
        wordCount,
    });
    // tslint:enable:object-literal-sort-keys
}
