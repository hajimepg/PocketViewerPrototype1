import Article from "../model/article";

export interface IArticleRepositoryInsertData {
    title: string;
    url: string;
    host: string;
    tags: string[];
    isUnread: boolean;
    isFavorite: boolean;
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
    findHosts(): Promise<string[]>;
    findTags(): Promise<string[]>;
}
