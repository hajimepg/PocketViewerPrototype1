import { Article } from "../model/article";

export interface IArticleRepository {
    insert(article: Article): Promise<Article>;
    update(article: Article): Promise<Article>;
    deleteAll(): Promise<void>;
    delete(article: Article): Promise<void>;
    findAll(): Promise<Article[]>;
    findUnread(): Promise<Article[]>;
    findFavorite(): Promise<Article[]>;
    findArchive(): Promise<Article[]>;
    findByHost(host: string): Promise<Article[]>;
    findByTag(tag: string): Promise<Article[]>;
    findById(id: number): Promise<Article | null>;
    findHosts(): Promise<string[]>;
    findTags(): Promise<string[]>;
}
