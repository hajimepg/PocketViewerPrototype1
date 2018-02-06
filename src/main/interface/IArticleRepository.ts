import { Article } from "../model/article";

export interface IArticleRepositoryInsertData {
    itemId: number;
    title: string;
    url: string;
    host: string;
    tags: string[];
    isUnread: boolean;
    isFavorite: boolean;
    isArchive: boolean;
    addedAt: Date;
}

export interface IArticleRepository {
    insert(data: IArticleRepositoryInsertData): Promise<Article>;
    update(article: Article): Promise<Article>;
    deleteAll(): Promise<void>;
    delete(article: Article): Promise<void>;
    findAll(): Promise<Article[]>;
    findUnread(): Promise<Article[]>;
    findFavorite(): Promise<Article[]>;
    findArchive(): Promise<Article[]>;
    findByHost(host: string): Promise<Article[]>;
    findByTag(tag: string): Promise<Article[]>;
    findByItemId(itemId: number): Promise<Article | null>;
    findHosts(): Promise<string[]>;
    findTags(): Promise<string[]>;
}
