export interface IArticleConstractorData {
    id: string;
    title: string;
    url: string;
    host: string;
    tags: string[];
    isUnread: boolean;
    isFavorite: boolean;
    isArchive: boolean;
    addedAt: Date;
    itemId: number;
}

export class Article {
    public readonly id: string;
    public title: string;
    public url: string;
    public host: string;
    public tags: string[];
    public isUnread: boolean;
    public isFavorite: boolean;
    public isArchive: boolean;
    public addedAt: Date;
    public itemId: number;

    public constructor(data: IArticleConstractorData) {
        this.id = data.id;
        this.title = data.title;
        this.url = data.url;
        this.host = data.host;
        this.tags = data.tags;
        this.isUnread = data.isUnread;
        this.isFavorite = data.isFavorite;
        this.addedAt = data.addedAt;
        this.itemId = data.itemId;
    }
}
