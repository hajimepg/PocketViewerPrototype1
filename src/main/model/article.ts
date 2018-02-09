import lodash from "lodash";

export interface IArticleConstractorData {
    id: number;
    title: string;
    url: string;
    host: string;
    tags: string[];
    isUnread: boolean;
    isFavorite: boolean;
    isArchive: boolean;
    addedAt: Date;
}

export class Article {
    public readonly id: number;
    public title: string;
    public url: string;
    public host: string;
    public tags: string[];
    public isUnread: boolean;
    public isFavorite: boolean;
    public isArchive: boolean;
    public addedAt: Date;

    public constructor(data: IArticleConstractorData) {
        this.id = data.id;
        this.title = data.title;
        this.url = data.url;
        this.host = data.host;
        this.tags = data.tags;
        this.isUnread = data.isUnread;
        this.isFavorite = data.isFavorite;
        this.isArchive = data.isArchive;
        this.addedAt = data.addedAt;
    }

    public isUpdated(other: Article): "updated" | "no updated" | "different id" {
        if (this.id !== other.id) {
            return "different id";
        }

        if (this.title !== other.title) {
            return "updated";
        }

        if (this.url !== other.url) {
            return "updated";
        }

        if (this.host !== other.host) {
            return "updated";
        }

        if (lodash.difference(this.tags, other.tags).length > 0) {
            return "updated";
        }

        if (this.isUnread !== other.isUnread) {
            return "updated";
        }

        if (this.isFavorite !== other.isFavorite) {
            return "updated";
        }

        if (this.isArchive !== other.isArchive) {
            return "updated";
        }

        if (this.addedAt.getTime() !== other.addedAt.getTime()) {
            return "updated";
        }

        return "no updated";
    }
}
