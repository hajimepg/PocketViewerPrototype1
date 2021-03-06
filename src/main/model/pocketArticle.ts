export interface IPocketArticleConstractorData {
    itemId: number;
    resolvedId: number;
    givenUrl: string;
    givenTitle: string;
    favorite: boolean;
    status: "normal" | "archived" | "deleted";
    timeAdded: Date;
    timeUpdated: Date;
    timeRead: Date | null;
    timeFavorited: Date | null;
    sortId: string;
    resolvedTitle: string;
    resolvedUrl: string;
    excerpt: string;
    isArticle: boolean;
    isIndex: string;
    hasVideo: "none" | "has in" | "is";
    hasImage: "none" | "has in" | "is";
    wordCount: number;
    rawData: any;
}

export class PocketArticle {
    public readonly itemId: number;
    public readonly resolvedId: number;
    public readonly givenUrl: string;
    public readonly givenTitle: string;
    public readonly favorite: boolean;
    public readonly status: "normal" | "archived" | "deleted";
    public readonly timeAdded: Date;
    public readonly timeUpdated: Date;
    public readonly timeRead: Date | null;
    public readonly timeFavorited: Date | null;
    public readonly sortId: string;
    public readonly resolvedTitle: string;
    public readonly resolvedUrl: string;
    public readonly excerpt: string;
    public readonly isArticle: boolean;
    public readonly isIndex: string;
    public readonly hasVideo: "none" | "has in" | "is";
    public readonly hasImage: "none" | "has in" | "is";
    public readonly wordCount: number;
    public readonly rawData: any;

    public get preferredUrl(): string {
        return this.resolvedUrl || this.givenUrl;
    }

    public get preferredTitle(): string {
        return this.resolvedTitle || this.givenTitle;
    }

    public constructor(data: IPocketArticleConstractorData) {
        this.itemId = data.itemId;
        this.resolvedId = data.resolvedId;
        this.givenTitle = data.givenTitle;
        this.givenUrl = data.givenUrl;
        this.favorite = data.favorite;
        this.status = data.status;
        this.timeAdded = data.timeAdded;
        this.timeUpdated = data.timeUpdated;
        this.timeRead = data.timeRead;
        this.timeFavorited = data.timeFavorited;
        this.sortId = data.sortId;
        this.resolvedTitle = data.resolvedTitle;
        this.resolvedUrl = data.resolvedUrl;
        this.excerpt = data.excerpt;
        this.isArticle = data.isArticle;
        this.isIndex = data.isIndex;
        this.hasVideo = data.hasVideo;
        this.hasImage = data.hasImage;
        this.wordCount = data.wordCount;
        this.rawData = data.rawData;
    }
}
