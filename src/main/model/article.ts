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
        this.addedAt = data.addedAt;
    }
}
